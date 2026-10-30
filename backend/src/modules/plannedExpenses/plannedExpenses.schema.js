import { z } from "zod";
import { amountSchema } from "../../utils/money.js";
import { dateStringSchema } from "../../utils/date.js";
import { commentSchema, idParamsSchema, childIdParamsSchema } from "../../utils/schemas.js";

export const createPlannedExpenseSchema = z.object({
  goalId: z.string().uuid("Noto'g'ri maqsad ID"),
  amount: amountSchema,
  date: dateStringSchema,
  comment: commentSchema.optional(),
});

export const updatePlannedExpenseSchema = z.object({
  goalId: z.string().uuid("Noto'g'ri maqsad ID").optional(),
  amount: amountSchema.optional(),
  date: dateStringSchema.optional(),
  comment: commentSchema.nullable().optional(),
});

export const listPlannedExpensesQuerySchema = z
  .object({
    from: dateStringSchema.optional(),
    to: dateStringSchema.optional(),
    goalId: z.string().uuid("Noto'g'ri maqsad ID").optional(),
  })
  .refine((q) => !q.from || !q.to || q.from <= q.to, { message: "Boshlanish sanasi tugash sanasidan keyin", path: ["from"] });

export const childIdParamSchema = childIdParamsSchema;

export const expenseIdParamSchema = idParamsSchema;
