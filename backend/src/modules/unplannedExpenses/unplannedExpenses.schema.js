import { z } from "zod";
import { amountSchema } from "../../utils/money.js";
import { dateStringSchema } from "../../utils/date.js";
import { idParamsSchema, childIdParamsSchema } from "../../utils/schemas.js";

const reasonSchema = z
  .string()
  .trim()
  .min(1, "Sabab kiritilishi shart")
  .max(500, "Sabab 500 belgidan oshmasligi kerak");

export const createUnplannedExpenseSchema = z.object({
  amount: amountSchema,
  reason: reasonSchema,
  date: dateStringSchema,
});

export const updateUnplannedExpenseSchema = z.object({
  amount: amountSchema.optional(),
  reason: reasonSchema.optional(),
  date: dateStringSchema.optional(),
});

export const listUnplannedExpensesQuerySchema = z
  .object({
    from: dateStringSchema.optional(),
    to: dateStringSchema.optional(),
  })
  .refine((q) => !q.from || !q.to || q.from <= q.to, { message: "Boshlanish sanasi tugash sanasidan keyin", path: ["from"] });

export const childIdParamSchema = childIdParamsSchema;

export const expenseIdParamSchema = idParamsSchema;
