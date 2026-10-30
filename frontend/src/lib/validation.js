import { z } from 'zod'

// Formalar uchun umumiy sxemalar — backend'dagi (utils/*.js) qoidalar bilan bir xil,
// shuning uchun foydalanuvchi xatoni so'rov yuborilmasidan oldin ko'radi.

const MAX_AMOUNT = 1_000_000_000_000n

export const moneySchema = z
  .string()
  .min(1, 'Summani kiriting')
  .regex(/^\d+$/, 'Summa faqat raqamlardan iborat bo\'lishi kerak')
  .refine((value) => BigInt(value) > 0n, "Summa 0 dan katta bo'lishi kerak")
  .refine((value) => BigInt(value) <= MAX_AMOUNT, 'Summa juda katta')

export const phoneSchema = z
  .string()
  .trim()
  .transform((value) => value.replace(/[\s()-]/g, ''))
  .pipe(z.string().regex(/^\+?\d{9,15}$/, 'Telefon raqamini to\'liq kiriting, masalan +998 90 123 45 67'))

export function nameSchema(label) {
  return z.string().trim().min(1, `${label} kiritilishi shart`).max(50, `${label} 50 belgidan oshmasligi kerak`)
}

export function newPasswordSchema(label = 'Parol') {
  return z
    .string()
    .min(6, `${label} kamida 6 ta belgidan iborat bo'lishi kerak`)
    .max(72, `${label} juda uzun (ko'pi bilan 72 belgi)`)
}

export const ageSchema = z.coerce
  .number({ error: 'Yoshni raqam bilan kiriting' })
  .int('Yosh butun son bo\'lishi kerak')
  .min(1, 'Yosh 1 dan 25 gacha bo\'lishi kerak')
  .max(25, 'Yosh 1 dan 25 gacha bo\'lishi kerak')

export const dateSchema = (message = 'Sana kiritilishi shart') => z.string().min(1, message)

export const commentSchema = z.string().trim().max(500, 'Izoh 500 belgidan oshmasligi kerak')
