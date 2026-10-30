import { z } from "zod";

// bcrypt faqat birinchi 72 baytni hisobga oladi — undan uzun parol jimgina
// kesilib qolmasligi uchun chegaralaymiz (kirill/emoji belgilar ko'p bayt oladi).
const BCRYPT_MAX_BYTES = 72;

export function passwordSchema(label = "Parol") {
  return z
    .string()
    .min(6, `${label} kamida 6 ta belgidan iborat bo'lishi kerak`)
    .refine((value) => Buffer.byteLength(value, "utf8") <= BCRYPT_MAX_BYTES, `${label} juda uzun (ko'pi bilan 72 belgi)`);
}

export function nameSchema(label) {
  return z.string().trim().min(1, `${label} kiritilishi shart`).max(50, `${label} 50 belgidan oshmasligi kerak`);
}

export const uuidSchema = z.string().uuid("Noto'g'ri ID formati");

export const idParamsSchema = z.object({ id: uuidSchema });

export const childIdParamsSchema = z.object({ childId: uuidSchema });

export const commentSchema = z.string().trim().max(500, "Izoh 500 belgidan oshmasligi kerak");
