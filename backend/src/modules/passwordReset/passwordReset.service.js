import crypto from "node:crypto";
import bcrypt from "bcrypt";
import { prisma } from "../../lib/prisma.js";
import { env } from "../../config/env.js";
import { ApiError } from "../../utils/response.js";
import { phoneDigitsOnly } from "../../utils/phone.js";

const BCRYPT_ROUNDS = 12;

function generateOtp() {
  return crypto.randomInt(0, 1_000_000).toString().padStart(6, "0");
}

function hashSecret(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export class PasswordResetService {
  async start({ phone }) {
    const recentCount = await prisma.passwordResetRequest.count({
      where: {
        phone,
        createdAt: { gte: new Date(Date.now() - env.passwordReset.rateLimitWindowMs) },
      },
    });
    if (recentCount >= env.passwordReset.rateLimitMax) {
      throw new ApiError(429, "Juda ko'p so'rov yuborildi. Birozdan so'ng qayta urinib ko'ring");
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

    if (request.status !== "otp_sent") {
      throw new ApiError(400, "Kod hali yuborilmagan. Avval botda telefon raqamingizni tasdiqlang");
    }
    if (request.otpAttempts >= env.passwordReset.maxOtpAttempts) {
      throw new ApiError(429, "Urinishlar soni tugadi. Qaytadan boshlang");
    }
    if (!request.otpExpiresAt || request.otpExpiresAt < new Date()) {
      throw new ApiError(400, "Kod muddati tugagan. Qaytadan boshlang");
    }

    if (hashSecret(otp) !== request.otpHash) {
      await prisma.passwordResetRequest.update({
        where: { id: request.id },
        data: { otpAttempts: { increment: 1 } },
      });
      throw new ApiError(400, "Kod noto'g'ri");
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    await prisma.passwordResetRequest.update({
      where: { id: request.id },
      data: {
        status: "verified",
        resetTokenHash: hashSecret(resetToken),
        resetTokenExpiresAt: new Date(Date.now() + env.passwordReset.resetTokenTtlMs),
      },
    });

    return { resetToken };
  }

  async confirm({ requestId, resetToken, newPassword }) {
    const request = await this.#findActive(requestId);

    if (request.status !== "verified") {
      throw new ApiError(400, "So'rov hali tasdiqlanmagan");
    }
    if (!request.resetTokenExpiresAt || request.resetTokenExpiresAt < new Date()) {
      throw new ApiError(400, "Muddati tugagan. Qaytadan boshlang");
    }
    if (hashSecret(resetToken) !== request.resetTokenHash) {
      throw new ApiError(400, "Token noto'g'ri");
    }

    const parent = await prisma.parent.findUnique({ where: { phone: request.phone } });
    if (!parent) {
      throw new ApiError(404, "Foydalanuvchi topilmadi");
    }

    const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

    await prisma.$transaction([
      prisma.parent.update({ where: { id: parent.id }, data: { passwordHash } }),
      prisma.refreshToken.updateMany({
        where: { userId: parent.id, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
      prisma.passwordResetRequest.update({ where: { id: request.id }, data: { status: "used" } }),
    ]);

    return { message: "Parol muvaffaqiyatli yangilandi" };
  }

  /** Telegram bot /start payload'ini qayta ishlash — bot moduli chaqiradi. */
  async handleBotStart({ requestId, chatId }) {
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
