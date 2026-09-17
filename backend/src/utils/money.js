import { z } from "zod";

// Summalar so'mda, butun son sifatida qabul qilinadi (raqam yoki satr),
// keyin DB uchun BigInt'ga aylantiriladi.
export const amountSchema = z
  .union([z.string(), z.number()])
  .transform((val, ctx) => {
    const str = String(val).trim();
    if (!/^\d+$/.test(str)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Summa musbat butun son bo'lishi kerak" });
      return z.NEVER;
    }
    const big = BigInt(str);
    if (big <= 0n) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Summa 0 dan katta bo'lishi kerak" });
      return z.NEVER;
    }
    return big;
  });
