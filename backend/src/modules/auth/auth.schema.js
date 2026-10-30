import { z } from "zod";
import { phoneSchema } from "../../utils/phone.js";
import { nameSchema, passwordSchema } from "../../utils/schemas.js";

// login/logout uchun oddiy format tekshiruvi — normalizatsiya qilinmaydi,
// chunki bu sxema bola login qilishida ham ishlatiladi va bolaning `phone`
// maydoni haqiqiy telefon emas, tasodifiy Kirish ID (children.schema.js'ga qarang).
// Ota-ona uchun normalizatsiya authService.loginParent() ichida qo'llanadi.
const loginPhoneSchema = z
  .string()
  .trim()
  .regex(/^\+?\d{9,15}$/, "Telefon raqami noto'g'ri formatda");

export const parentRegisterSchema = z.object({
  firstName: nameSchema("Ism"),
  lastName: nameSchema("Familiya"),
  phone: phoneSchema,
  password: passwordSchema(),
});

export const loginSchema = z.object({
  phone: loginPhoneSchema,
  password: z.string().min(1, "Parol kiritilishi shart").max(200, "Parol juda uzun"),
});
