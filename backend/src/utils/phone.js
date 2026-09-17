import { z } from "zod";

// O'zbekiston raqamlariga xos holatlarni bitta standart ko'rinishga keltiradi:
// - kod ko'rsatilmagan 9 xonali raqam ("901234567") -> "998" qo'shiladi
// - eski shahar-oralig'i terish kodi "8" + 9 xonali raqam ("8901234567") -> "8" olib tashlanadi, "998" qo'shiladi
// Bu ayniqsa Telegram bot bilan solishtirishda muhim: Telegram `contact.phone_number`
// har doim to'liq davlat kodi bilan (plyussiz) qaytadi, foydalanuvchi esa saytda
// ko'pincha kodsiz kiritadi.
export function normalizePhone(rawPhone) {
  let digits = String(rawPhone).replace(/\D/g, "");

  if (digits.length === 10 && digits.startsWith("8") && !digits.startsWith("998")) {
    digits = digits.slice(1);
  }

  if (digits.length === 9) {
    digits = `998${digits}`;
  }

  return `+${digits}`;
}

/** Faqat raqamlar (plyussiz) — Telegram kontakt raqami bilan solishtirish uchun. */
export function phoneDigitsOnly(rawPhone) {
  return String(rawPhone).replace(/\D/g, "");
}

export const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+?\d{9,15}$/, "Telefon raqami noto'g'ri formatda")
  .transform(normalizePhone);
