import { z } from "zod";
import { nameSchema, passwordSchema, idParamsSchema } from "../../utils/schemas.js";

// Diqqat: bola uchun `phone` haqiqiy telefon raqami EMAS — bu shunchaki
// login qilish uchun ishlatiladigan tasodifiy 9-15 xonali ID (bola telefon
// egasi bo'lishi shart emas). Shuning uchun bu yerda O'zbekiston telefon
// normalizatsiyasi (utils/phone.js) ataylab qo'llanilmaydi — aks holda
// "Kirish ID"ga soxta "+998" prefiksi qo'shilib qolardi.
const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+?\d{9,15}$/, "Kirish ID noto'g'ri formatda");

const ageSchema = z.coerce
  .number({ error: "Yoshni raqam bilan kiriting" })
  .int("Yosh butun son bo'lishi kerak")
  .min(1, "Yosh 1 dan 25 gacha bo'lishi kerak")
  .max(25, "Yosh 1 dan 25 gacha bo'lishi kerak");

export const createChildSchema = z.object({
  firstName: nameSchema("Ism"),
  lastName: nameSchema("Familiya"),
  age: ageSchema,
  phone: phoneSchema,
  password: passwordSchema(),
});

export const updateChildSchema = z.object({
  firstName: nameSchema("Ism").optional(),
  lastName: nameSchema("Familiya").optional(),
  age: ageSchema.optional(),
  phone: phoneSchema.optional(),
});

export const resetChildPasswordSchema = z.object({
  newPassword: passwordSchema("Yangi parol"),
});

export const childIdParamSchema = idParamsSchema;
