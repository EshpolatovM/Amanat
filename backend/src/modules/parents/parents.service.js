import bcrypt from "bcrypt";
import { prisma } from "../../lib/prisma.js";
import { ApiError } from "../../utils/response.js";

const BCRYPT_ROUNDS = 12;

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

  async changePassword(parentId, { currentPassword, newPassword }) {
    const parent = await prisma.parent.findUnique({ where: { id: parentId } });
    if (!parent) throw new ApiError(404, "Ota-ona topilmadi");

    const valid = await bcrypt.compare(currentPassword, parent.passwordHash);
    if (!valid) throw new ApiError(401, "Joriy parol noto'g'ri");

    const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    await prisma.parent.update({ where: { id: parentId }, data: { passwordHash } });
    return { message: "Parol muvaffaqiyatli o'zgartirildi" };
  }
}

export const parentsService = new ParentsService();
