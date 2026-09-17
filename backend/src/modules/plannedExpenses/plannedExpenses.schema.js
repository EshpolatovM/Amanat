import { z } from "zod";
import { amountSchema } from "../../utils/money.js";
import { dateStringSchema } from "../../utils/date.js";

export const createPlannedExpenseSchema = z.object({
  goalId: z.string().uuid("Noto'g'ri maqsad ID"),
  amount: amountSchema,
  date: dateStringSchema,
  comment: z.string().trim().max(500).optional(),
});

export const updatePlannedExpenseSchema = z.object({
  goalId: z.string().uuid("Noto'g'ri maqsad ID").optional(),
  amount: amountSchema.optional(),
  date: dateStringSchema.optional(),
  comment: z.string().trim().max(500).nullable().optional(),
});

export const listPlannedExpensesQuerySchema = z.object({
  from: dateStringSchema.optional(),
  to: dateStringSchema.optional(),
  goalId: z.string().uuid().optional(),
});

export const childIdParamSchema = z.object({
  childId: z.string().uuid("Noto'g'ri ID formati"),
});

export const expenseIdParamSchema = z.object({
  id: z.string().uuid("Noto'g'ri ID formati"),
});
