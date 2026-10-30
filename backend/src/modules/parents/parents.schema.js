import { z } from "zod";
import { phoneSchema } from "../../utils/phone.js";
import { nameSchema, passwordSchema } from "../../utils/schemas.js";

export const updateParentSchema = z.object({
  firstName: nameSchema("Ism").optional(),
  lastName: nameSchema("Familiya").optional(),
  phone: phoneSchema.optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Joriy parol kiritilishi shart").max(200, "Parol juda uzun"),
  newPassword: passwordSchema("Yangi parol"),
});
