import bcrypt from "bcrypt";
import { prisma } from "../../lib/prisma.js";
import { ApiError } from "../../utils/response.js";
import { accessControlService } from "../../lib/access.js";

const BCRYPT_ROUNDS = 12;

export class ChildrenService {
  #serialize(child) {
    return {
      id: child.id,
      parentId: child.parentId,
      firstName: child.firstName,
      lastName: child.lastName,
      age: child.age,
      phone: child.phone,
      createdAt: child.createdAt,
      updatedAt: child.updatedAt,
    };
  }

  async createChild(parentId, data) {
    const existing = await prisma.child.findUnique({ where: { phone: data.phone } });
    if (existing) {
      throw new ApiError(409, "Bu telefon raqami bilan foydalanuvchi allaqachon mavjud");
    }

    const passwordHash = await bcrypt.hash(data.password, BCRYPT_ROUNDS);
    const child = await prisma.child.create({
      data: {
        parentId,
        firstName: data.firstName,
        lastName: data.lastName,
        age: data.age,
        phone: data.phone,
        passwordHash,
      },
    });
    return this.#serialize(child);
  }

  async listChildren(parentId) {
    const children = await prisma.child.findMany({
      where: { parentId },
      orderBy: { createdAt: "asc" },
    });
    return children.map((child) => this.#serialize(child));
  }

  async getChild(user, childId) {
    const child = await accessControlService.assertChildAccess(user, childId);
    return this.#serialize(child);
  }

  async updateChild(parentId, childId, data) {
    await accessControlService.assertParentOwnsChild(parentId, childId);

    if (data.phone) {
      const existing = await prisma.child.findUnique({ where: { phone: data.phone } });
      if (existing && existing.id !== childId) {
        throw new ApiError(409, "Bu telefon raqami bilan foydalanuvchi allaqachon mavjud");
      }
    }

    const child = await prisma.child.update({ where: { id: childId }, data });
    return this.#serialize(child);
  }

  async deleteChild(parentId, childId) {
    await accessControlService.assertParentOwnsChild(parentId, childId);
    await prisma.child.delete({ where: { id: childId } });
    return { message: "Bola profili o'chirildi" };
  }

  async resetChildPassword(parentId, childId, newPassword) {
    await accessControlService.assertParentOwnsChild(parentId, childId);
    const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    await prisma.child.update({ where: { id: childId }, data: { passwordHash } });
    return { message: "Bola paroli o'zgartirildi" };
  }
}

export const childrenService = new ChildrenService();
