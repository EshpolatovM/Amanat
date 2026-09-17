import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import { env } from "../config/env.js";

export class TokenService {
  signAccessToken({ id, role }) {
    // jti bo'lmasa, bir soniya ichida ketma-ket chaqirilgan sign()'lar
    // (iat sekundgacha aniqlikda) baytma-bayt bir xil token qaytaradi —
    // bu esa refresh_tokens.token_hash unique cheklovida to'qnashuvga olib keladi.
    return jwt.sign({ sub: id, role, jti: crypto.randomUUID() }, env.jwt.accessSecret, {
      expiresIn: env.jwt.accessExpiresIn,
    });
  }

  signRefreshToken({ id, role }) {
    return jwt.sign({ sub: id, role, jti: crypto.randomUUID() }, env.jwt.refreshSecret, {
      expiresIn: env.jwt.refreshExpiresIn,
    });
  }

  verifyAccessToken(token) {
    return jwt.verify(token, env.jwt.accessSecret);
  }

  verifyRefreshToken(token) {
    return jwt.verify(token, env.jwt.refreshSecret);
  }

  hashToken(token) {
    return crypto.createHash("sha256").update(token).digest("hex");
  }

  #parseExpiryToMs(expiresIn) {
    const match = /^(\d+)([smhd])$/.exec(expiresIn);
    if (!match) return 15 * 60 * 1000;
    const value = Number(match[1]);
    const unit = match[2];
    const multipliers = { s: 1000, m: 60 * 1000, h: 60 * 60 * 1000, d: 24 * 60 * 60 * 1000 };
    return value * multipliers[unit];
  }

  refreshTokenExpiryDate() {
    return new Date(Date.now() + this.#parseExpiryToMs(env.jwt.refreshExpiresIn));
  }

  accessTokenMaxAgeMs() {
    return this.#parseExpiryToMs(env.jwt.accessExpiresIn);
  }

  refreshTokenMaxAgeMs() {
    return this.#parseExpiryToMs(env.jwt.refreshExpiresIn);
  }
}

export const tokenService = new TokenService();
