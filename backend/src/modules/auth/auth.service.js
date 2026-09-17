import bcrypt from "bcrypt";
import { prisma } from "../../lib/prisma.js";
import { tokenService } from "../../lib/jwt.js";
import { ApiError } from "../../utils/response.js";
import { normalizePhone } from "../../utils/phone.js";

const BCRYPT_ROUNDS = 12;

export class AuthService {
  #serializeParent(parent) {
    return {
      id: parent.id,
      role: "parent",
      firstName: parent.firstName,
      lastName: parent.lastName,
      phone: parent.phone,
      createdAt: parent.createdAt,
    };
  }

  #serializeChild(child) {
    return {
      id: child.id,
      role: "child",
      parentId: child.parentId,
      firstName: child.firstName,
      lastName: child.lastName,
      age: child.age,
      phone: child.phone,
      createdAt: child.createdAt,
    };
  }

  async #issueTokens(user, role) {
    const accessToken = tokenService.signAccessToken({ id: user.id, role });
    const refreshToken = tokenService.signRefreshToken({ id: user.id, role });

    await prisma.refreshToken.create({
      data: {
        tokenHash: tokenService.hashToken(refreshToken),
        userId: user.id,
        userType: role,
        expiresAt: tokenService.refreshTokenExpiryDate(),
      },
    });

    return { accessToken, refreshToken };
  }

  async registerParent({ firstName, lastName, phone, password }) {
    const existing = await prisma.parent.findUnique({ where: { phone } });
    if (existing) {
      throw new ApiError(409, "Bu telefon raqami bilan foydalanuvchi allaqachon mavjud");
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const parent = await prisma.parent.create({
      data: { firstName, lastName, phone, passwordHash },
    });

    const tokens = await this.#issueTokens(parent, "parent");
    return { user: this.#serializeParent(parent), ...tokens };
  }

  async loginParent({ phone, password }) {
    const parent = await prisma.parent.findUnique({ where: { phone: normalizePhone(phone) } });
    if (!parent) {
      throw new ApiError(401, "Telefon raqami yoki parol noto'g'ri");
    }

    const valid = await bcrypt.compare(password, parent.passwordHash);
    if (!valid) {
      throw new ApiError(401, "Telefon raqami yoki parol noto'g'ri");
    }

    const tokens = await this.#issueTokens(parent, "parent");
    return { user: this.#serializeParent(parent), ...tokens };
  }

  async loginChild({ phone, password }) {
    const child = await prisma.child.findUnique({ where: { phone } });
    if (!child) {
      throw new ApiError(401, "Telefon raqami yoki parol noto'g'ri");
    }

    const valid = await bcrypt.compare(password, child.passwordHash);
    if (!valid) {
      throw new ApiError(401, "Telefon raqami yoki parol noto'g'ri");
    }

    const tokens = await this.#issueTokens(child, "child");
    return { user: this.#serializeChild(child), ...tokens };
  }

  async refreshSession(refreshTokenCookie) {
    if (!refreshTokenCookie) {
      throw new ApiError(401, "Refresh token topilmadi");
    }

    let payload;
    try {
      payload = tokenService.verifyRefreshToken(refreshTokenCookie);
    } catch {
      throw new ApiError(401, "Refresh token yaroqsiz yoki muddati tugagan");
    }

    const tokenHash = tokenService.hashToken(refreshTokenCookie);
    const stored = await prisma.refreshToken.findUnique({ where: { tokenHash } });

    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      throw new ApiError(401, "Refresh token yaroqsiz yoki muddati tugagan");
    }

    await prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    let user;
    if (payload.role === "parent") {
      const parent = await prisma.parent.findUnique({ where: { id: payload.sub } });
      if (!parent) throw new ApiError(401, "Foydalanuvchi topilmadi");
      user = this.#serializeParent(parent);
    } else {
      const child = await prisma.child.findUnique({ where: { id: payload.sub } });
      if (!child) throw new ApiError(401, "Foydalanuvchi topilmadi");
      user = this.#serializeChild(child);
    }

    const tokens = await this.#issueTokens({ id: payload.sub }, payload.role);
    return { user, ...tokens };
  }

  async logout(refreshTokenCookie) {
    if (!refreshTokenCookie) return;
    const tokenHash = tokenService.hashToken(refreshTokenCookie);
    await prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async getMe(user) {
    if (user.role === "parent") {
      const parent = await prisma.parent.findUnique({ where: { id: user.id } });
      if (!parent) throw new ApiError(404, "Foydalanuvchi topilmadi");
      return this.#serializeParent(parent);
    }

    const child = await prisma.child.findUnique({ where: { id: user.id } });
    if (!child) throw new ApiError(404, "Foydalanuvchi topilmadi");
    return this.#serializeChild(child);
  }
}

export const authService = new AuthService();
