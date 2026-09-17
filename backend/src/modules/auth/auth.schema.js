import { z } from "zod";
import { phoneSchema } from "../../utils/phone.js";

const passwordSchema = z.string().min(6, "Parol kamida 6 ta belgidan iborat bo'lishi kerak");

// login/logout uchun oddiy format tekshiruvi — normalizatsiya qilinmaydi,
// chunki bu sxema bola login qilishida ham ishlatiladi va bolaning `phone`
// maydoni haqiqiy telefon emas, tasodifiy Kirish ID (children.schema.js'ga qarang).
// Ota-ona uchun normalizatsiya authService.loginParent() ichida qo'llanadi.
const loginPhoneSchema = z
  .string()
  .trim()
  .regex(/^\+?\d{9,15}$/, "Telefon raqami noto'g'ri formatda");

export const parentRegisterSchema = z.object({
  firstName: z.string().trim().min(1, "Ism kiritilishi shart"),
  lastName: z.string().trim().min(1, "Familiya kiritilishi shart"),
  phone: phoneSchema,
  password: passwordSchema,
});

export const loginSchema = z.object({
  phone: loginPhoneSchema,
  password: z.string().min(1, "Parol kiritilishi shart"),
});
