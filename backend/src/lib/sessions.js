import { prisma } from "./prisma.js";
import { tokenService } from "./jwt.js";

// Foydalanuvchining barcha faol refresh tokenlarini bekor qiladi (parol
// o'zgarganda boshqa qurilmalardagi sessiyalar yopilishi uchun).
// `exceptRefreshToken` berilsa — joriy sessiya saqlab qolinadi.
export async function revokeUserSessions(userId, { exceptRefreshToken } = {}) {
  const where = { userId, revokedAt: null };
  if (exceptRefreshToken) {
    where.tokenHash = { not: tokenService.hashToken(exceptRefreshToken) };
  }
  await prisma.refreshToken.updateMany({ where, data: { revokedAt: new Date() } });
}
