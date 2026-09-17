import { z } from "zod";
import { amountSchema } from "../../utils/money.js";
import { dateStringSchema } from "../../utils/date.js";

export const createUnplannedExpenseSchema = z.object({
  amount: amountSchema,
  reason: z.string().trim().min(1, "Sabab kiritilishi shart").max(500),
  date: dateStringSchema,
});

export const updateUnplannedExpenseSchema = z.object({
  amount: amountSchema.optional(),
  reason: z.string().trim().min(1).max(500).optional(),
  date: dateStringSchema.optional(),
});

export const listUnplannedExpensesQuerySchema = z.object({
  from: dateStringSchema.optional(),
  to: dateStringSchema.optional(),
});

export const childIdParamSchema = z.object({
  childId: z.string().uuid("Noto'g'ri ID formati"),
});

export const expenseIdParamSchema = z.object({
  id: z.string().uuid("Noto'g'ri ID formati"),
});
