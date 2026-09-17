import { z } from "zod";

// Diqqat: bola uchun `phone` haqiqiy telefon raqami EMAS — bu shunchaki
// login qilish uchun ishlatiladigan tasodifiy 9-15 xonali ID (bola telefon
// egasi bo'lishi shart emas). Shuning uchun bu yerda O'zbekiston telefon
// normalizatsiyasi (utils/phone.js) ataylab qo'llanilmaydi — aks holda
// "Kirish ID"ga soxta "+998" prefiksi qo'shilib qolardi.
const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+?\d{9,15}$/, "Kirish ID noto'g'ri formatda");

export const createChildSchema = z.object({
  firstName: z.string().trim().min(1, "Ism kiritilishi shart"),
  lastName: z.string().trim().min(1, "Familiya kiritilishi shart"),
  age: z.coerce.number().int().min(1, "Yosh noto'g'ri").max(25, "Yosh noto'g'ri"),
  phone: phoneSchema,
  password: z.string().min(6, "Parol kamida 6 ta belgidan iborat bo'lishi kerak"),
});

export const updateChildSchema = z.object({
  firstName: z.string().trim().min(1).optional(),
  lastName: z.string().trim().min(1).optional(),
  age: z.coerce.number().int().min(1).max(25).optional(),
  phone: phoneSchema.optional(),
});

export const resetChildPasswordSchema = z.object({
  newPassword: z.string().min(6, "Yangi parol kamida 6 ta belgidan iborat bo'lishi kerak"),
});

export const childIdParamSchema = z.object({
  id: z.string().uuid("Noto'g'ri ID formati"),
});
