import { z } from "zod";
import { phoneSchema } from "../../utils/phone.js";

export const updateParentSchema = z.object({
  firstName: z.string().trim().min(1).optional(),
  lastName: z.string().trim().min(1).optional(),
  phone: phoneSchema.optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Joriy parol kiritilishi shart"),
  newPassword: z.string().min(6, "Yangi parol kamida 6 ta belgidan iborat bo'lishi kerak"),
});
