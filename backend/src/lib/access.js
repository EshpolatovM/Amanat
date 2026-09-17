import { prisma } from "./prisma.js";
import { ApiError } from "../utils/response.js";

export class AccessControlService {
  // Berilgan foydalanuvchi (ota-ona yoki bola) shu childId'ga tegishli
  // ma'lumotlarni ko'rish/o'zgartirish huquqiga ega ekanini tekshiradi.
  // Ota-ona faqat o'z bolalariga, bola esa faqat o'ziga kira oladi.
  async assertChildAccess(user, childId) {
    const child = await prisma.child.findUnique({ where: { id: childId } });
    if (!child) {
      throw new ApiError(404, "Bola topilmadi");
    }

    if (user.role === "child" && user.id !== child.id) {
      throw new ApiError(403, "Bu amal uchun ruxsat yo'q");
    }

    if (user.role === "parent" && user.id !== child.parentId) {
      throw new ApiError(403, "Bu amal uchun ruxsat yo'q");
    }

    return child;
  }

  async assertParentOwnsChild(parentId, childId) {
    const child = await prisma.child.findUnique({ where: { id: childId } });
    if (!child || child.parentId !== parentId) {
      throw new ApiError(404, "Bola topilmadi");
    }
    return child;
  }

  // Dashboard/statistika uchun: foydalanuvchi ko'rishi mumkin bo'lgan
  // childId'lar ro'yxatini aniqlaydi (bola — o'zi, ota-ona — bitta bola
  // yoki so'ralmasa barcha bolalari).
  async resolveChildScope(user, requestedChildId) {
    if (user.role === "child") {
      return [user.id];
    }

    if (requestedChildId) {
      const child = await prisma.child.findUnique({ where: { id: requestedChildId } });
      if (!child || child.parentId !== user.id) {
        throw new ApiError(404, "Bola topilmadi");
      }
      return [requestedChildId];
    }

    const children = await prisma.child.findMany({ where: { parentId: user.id }, select: { id: true } });
    return children.map((c) => c.id);
  }
}

export const accessControlService = new AccessControlService();
