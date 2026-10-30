import { prisma } from "../../lib/prisma.js";
import { hashPassword } from "../../lib/password.js";
import { revokeUserSessions } from "../../lib/sessions.js";
import { ApiError } from "../../utils/response.js";
import { accessControlService } from "../../lib/access.js";

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
      throw new ApiError(409, "Bu Kirish ID band");
    }

    const passwordHash = await hashPassword(data.password);
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
        throw new ApiError(409, "Bu Kirish ID band");
      }
    }

    const child = await prisma.child.update({ where: { id: childId }, data });
    return this.#serialize(child);
  }

  async deleteChild(parentId, childId) {
    await accessControlService.assertParentOwnsChild(parentId, childId);
    await prisma.child.delete({ where: { id: childId } });
    await revokeUserSessions(childId);
    return { message: "Bola profili o'chirildi" };
  }

  // Parol yangilanganda bolaning barcha qurilmalaridagi sessiyalar yopiladi —
  // parol begona qo'lga tushgan bo'lsa, eski sessiya ham ishlamay qoladi.
  async resetChildPassword(parentId, childId, newPassword) {
    await accessControlService.assertParentOwnsChild(parentId, childId);
    const passwordHash = await hashPassword(newPassword);
    await prisma.child.update({ where: { id: childId }, data: { passwordHash } });
    await revokeUserSessions(childId);
    return { message: "Bola paroli o'zgartirildi" };
  }
}

export const childrenService = new ChildrenService();
