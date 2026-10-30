import crypto from "node:crypto";
import { prisma } from "../../lib/prisma.js";
import { env } from "../../config/env.js";
import { hashPassword } from "../../lib/password.js";
import { ApiError } from "../../utils/response.js";
import { phoneDigitsOnly } from "../../utils/phone.js";

function generateOtp() {
  return crypto.randomInt(0, 1_000_000).toString().padStart(6, "0");
}

function hashSecret(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

// Ikkala tomon ham sha256 hex (bir xil uzunlik) — solishtirish vaqti mos
// kelgan belgilar soniga bog'liq bo'lmasligi uchun timingSafeEqual ishlatiladi.
function secretMatches(plain, storedHash) {
  if (!storedHash) return false;
  const actual = Buffer.from(hashSecret(plain), "hex");
  const expected = Buffer.from(storedHash, "hex");
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
}

const ALREADY_USED_MESSAGE = "Bu so'rov allaqachon ishlatilgan. Parolni tiklashni qaytadan boshlang";

export class PasswordResetService {
  async start({ phone }) {
    if (!env.telegram.botToken || !env.telegram.botUsername) {
      throw new ApiError(503, "Parolni tiklash xizmati hozircha ishlamayapti. Keyinroq urinib ko'ring");
    }

    const recentCount = await prisma.passwordResetRequest.count({
      where: {
        phone,
        createdAt: { gte: new Date(Date.now() - env.passwordReset.rateLimitWindowMs) },
      },
    });
    if (recentCount >= env.passwordReset.rateLimitMax) {
      throw new ApiError(429, "Juda ko'p so'rov yuborildi. Bir daqiqadan so'ng qayta urinib ko'ring");
    }

    const request = await prisma.passwordResetRequest.create({
      data: {
        phone,
        expiresAt: new Date(Date.now() + env.passwordReset.requestTtlMs),
      },
    });

    return {
      requestId: request.id,
      botDeepLink: `https://t.me/${env.telegram.botUsername}?start=${request.id}`,
      expiresAt: request.expiresAt,
    };
  }

  async getStatus(requestId) {
    const request = await this.#findActive(requestId);
    return { status: request.status };
  }

  async verifyOtp({ requestId, otp }) {
    const request = await this.#findActive(requestId);

    if (request.status === "used") {
      throw new ApiError(410, ALREADY_USED_MESSAGE);
    }
    if (request.status !== "otp_sent") {
      throw new ApiError(400, "Kod hali yuborilmagan. Avval botda telefon raqamingizni tasdiqlang");
    }
    if (!request.otpExpiresAt || request.otpExpiresAt < new Date()) {
      throw new ApiError(400, "Kod muddati tugagan. Qaytadan boshlang");
    }

    // Urinish kodni solishtirishdan OLDIN atomik tarzda hisobga olinadi —
    // aks holda parallel so'rovlar bilan 5 urinish chegarasini aylanib o'tib,
    // kodni taxmin qilish mumkin bo'lardi.
    const reserved = await prisma.passwordResetRequest.updateMany({
      where: { id: request.id, status: "otp_sent", otpAttempts: { lt: env.passwordReset.maxOtpAttempts } },
      data: { otpAttempts: { increment: 1 } },
    });
    if (reserved.count === 0) {
      throw new ApiError(429, "Urinishlar soni tugadi. Qaytadan boshlang");
    }

    if (!secretMatches(otp, request.otpHash)) {
      const attemptsLeft = env.passwordReset.maxOtpAttempts - request.otpAttempts - 1;
      throw new ApiError(
        400,
        attemptsLeft > 0
          ? `Kod noto'g'ri. Yana ${attemptsLeft} ta urinish qoldi`
          : "Kod noto'g'ri. Urinishlar tugadi — qaytadan boshlang",
      );
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    await prisma.passwordResetRequest.update({
      where: { id: request.id },
      data: {
        status: "verified",
        otpHash: null,
        resetTokenHash: hashSecret(resetToken),
        resetTokenExpiresAt: new Date(Date.now() + env.passwordReset.resetTokenTtlMs),
      },
    });

    return { resetToken };
  }

  async confirm({ requestId, resetToken, newPassword }) {
    const request = await this.#findActive(requestId);

    if (request.status === "used") {
      throw new ApiError(410, ALREADY_USED_MESSAGE);
    }
    if (request.status !== "verified") {
      throw new ApiError(400, "So'rov hali tasdiqlanmagan");
    }
    if (!request.resetTokenExpiresAt || request.resetTokenExpiresAt < new Date()) {
      throw new ApiError(400, "Muddati tugagan. Qaytadan boshlang");
    }
    if (!secretMatches(resetToken, request.resetTokenHash)) {
      throw new ApiError(400, "Token noto'g'ri");
    }

    const parent = await prisma.parent.findUnique({ where: { phone: request.phone } });
    if (!parent) {
      throw new ApiError(404, "Foydalanuvchi topilmadi");
    }

    const passwordHash = await hashPassword(newPassword);

    await prisma.$transaction(async (tx) => {
      // Bir martalik (TZ 6.1): faqat hali "verified" holatidagi so'rov "used"ga
      // o'tadi — bir xil token bilan parallel ikkinchi so'rov shu yerda to'xtaydi.
      const consumed = await tx.passwordResetRequest.updateMany({
        where: { id: request.id, status: "verified" },
        data: { status: "used", resetTokenHash: null },
      });
      if (consumed.count === 0) {
        throw new ApiError(410, ALREADY_USED_MESSAGE);
      }

      await tx.parent.update({ where: { id: parent.id }, data: { passwordHash } });
      await tx.refreshToken.updateMany({
        where: { userId: parent.id, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    });

    return { message: "Parol muvaffaqiyatli yangilandi" };
  }

  /** Telegram bot /start payload'ini qayta ishlash — bot moduli chaqiradi. */
  async handleBotStart({ requestId, chatId }) {
    if (!/^[0-9a-f-]{36}$/i.test(requestId)) {
      return { ok: false };
    }

    const request = await prisma.passwordResetRequest.findUnique({ where: { id: requestId } });
    if (!request || request.status !== "pending_telegram" || request.expiresAt < new Date()) {
      return { ok: false };
    }

    await prisma.passwordResetRequest.update({
      where: { id: request.id },
      data: { chatId: String(chatId) },
    });

    return { ok: true };
  }

  /** Telegram'dan `request_contact` orqali kelgan kontaktni tekshiradi — bot moduli chaqiradi. */
  async handleContactShared({ chatId, phoneNumber }) {
    const request = await prisma.passwordResetRequest.findFirst({
      where: { chatId: String(chatId), status: "pending_telegram" },
      orderBy: { createdAt: "desc" },
    });
    if (!request || request.expiresAt < new Date()) {
      return { ok: false, reason: "not_found" };
    }

    if (phoneDigitsOnly(phoneNumber) !== phoneDigitsOnly(request.phone)) {
      return { ok: false, reason: "phone_mismatch" };
    }

    const parent = await prisma.parent.findUnique({ where: { phone: request.phone } });
    if (!parent) {
      return { ok: false, reason: "not_registered" };
    }

    const otp = generateOtp();
    await prisma.passwordResetRequest.update({
      where: { id: request.id },
      data: {
        status: "otp_sent",
        otpHash: hashSecret(otp),
        otpExpiresAt: new Date(Date.now() + env.passwordReset.otpTtlMs),
        otpAttempts: 0,
      },
    });

    return { ok: true, otp };
  }

  // Muddati o'tgan / ishlatilgan so'rovlarni tozalash (kunlik cron).
  async deleteStaleRequests() {
    const { count } = await prisma.passwordResetRequest.deleteMany({
      where: { createdAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
    });
    return count;
  }

  async #findActive(requestId) {
    const request = await prisma.passwordResetRequest.findUnique({ where: { id: requestId } });
    if (!request) {
      throw new ApiError(404, "So'rov topilmadi");
    }
    if (request.status !== "used" && request.expiresAt < new Date()) {
      throw new ApiError(410, "So'rov muddati tugagan. Qaytadan boshlang");
    }
    return request;
  }
}

export const passwordResetService = new PasswordResetService();
