import { prisma } from "../../lib/prisma.js";
import { hashPassword, verifyPassword } from "../../lib/password.js";
import { revokeUserSessions } from "../../lib/sessions.js";
import { ApiError } from "../../utils/response.js";

export class ParentsService {
  #serialize(parent) {
    return {
      id: parent.id,
      firstName: parent.firstName,
      lastName: parent.lastName,
      phone: parent.phone,
      createdAt: parent.createdAt,
      updatedAt: parent.updatedAt,
    };
  }

  async getProfile(parentId) {
    const parent = await prisma.parent.findUnique({ where: { id: parentId } });
    if (!parent) throw new ApiError(404, "Ota-ona topilmadi");
    return this.#serialize(parent);
  }

  async updateProfile(parentId, data) {
    if (data.phone) {
      const existing = await prisma.parent.findUnique({ where: { phone: data.phone } });
      if (existing && existing.id !== parentId) {
        throw new ApiError(409, "Bu telefon raqami bilan foydalanuvchi allaqachon mavjud");
      }
    }

    const parent = await prisma.parent.update({ where: { id: parentId }, data });
    return this.#serialize(parent);
  }

  // Parol o'zgarganda boshqa qurilmalardagi sessiyalar yopiladi (parol
  // o'g'irlangan bo'lsa, begona qurilma ham chiqib ketadi), joriysi qoladi.
  async changePassword(parentId, { currentPassword, newPassword }, currentRefreshToken) {
    const parent = await prisma.parent.findUnique({ where: { id: parentId } });
    if (!parent) throw new ApiError(404, "Ota-ona topilmadi");

    const valid = await verifyPassword(currentPassword, parent.passwordHash);
    if (!valid) throw new ApiError(400, "Joriy parol noto'g'ri");

    const passwordHash = await hashPassword(newPassword);
    await prisma.parent.update({ where: { id: parentId }, data: { passwordHash } });
    await revokeUserSessions(parentId, { exceptRefreshToken: currentRefreshToken });
    return { message: "Parol muvaffaqiyatli o'zgartirildi" };
  }
}

export const parentsService = new ParentsService();
