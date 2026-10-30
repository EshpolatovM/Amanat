import { z } from "zod";

// Bitta yozuv uchun yuqori chegara — 1 trillion so'm. BigInt ustuni (int8)
// bundan ancha kattasini sig'diradi, lekin chegara bo'lmasa 20+ xonali son
// DB'da 500 xatoligiga, bexosdan qo'shilgan nollar esa statistikani buzishga olib keladi.
export const MAX_AMOUNT = 1_000_000_000_000n;

// Summalar so'mda, butun son sifatida qabul qilinadi (raqam yoki satr),
// keyin DB uchun BigInt'ga aylantiriladi.
export const amountSchema = z
  .union([z.string(), z.number()])
  .transform((val, ctx) => {
    const str = String(val).trim();
    if (!/^\d{1,15}$/.test(str)) {
      ctx.addIssue({ code: "custom", message: "Summa musbat butun son bo'lishi kerak" });
      return z.NEVER;
    }
    const big = BigInt(str);
    if (big <= 0n) {
      ctx.addIssue({ code: "custom", message: "Summa 0 dan katta bo'lishi kerak" });
      return z.NEVER;
    }
    if (big > MAX_AMOUNT) {
      ctx.addIssue({ code: "custom", message: "Summa juda katta — 1 000 000 000 000 so'mdan oshmasligi kerak" });
      return z.NEVER;
    }
    return big;
  });
