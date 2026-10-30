import { z } from "zod";
import { phoneSchema } from "../../utils/phone.js";
import { passwordSchema } from "../../utils/schemas.js";

export const requestIdParamsSchema = z.object({
  requestId: z.string().uuid("So'rov identifikatori noto'g'ri"),
});

export const startResetSchema = z.object({
  phone: phoneSchema,
});

export const verifyOtpSchema = z.object({
  otp: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Kod 6 xonali raqamdan iborat bo'lishi kerak"),
});

export const confirmResetSchema = z.object({
  requestId: z.string().uuid("So'rov identifikatori noto'g'ri"),
  resetToken: z.string().trim().min(1, "Token kiritilishi shart").max(200, "Token noto'g'ri"),
  newPassword: passwordSchema(),
});
