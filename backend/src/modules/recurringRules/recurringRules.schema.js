import { z } from "zod";
import { amountSchema } from "../../utils/money.js";
import { dateStringSchema } from "../../utils/date.js";
import { commentSchema, idParamsSchema, childIdParamsSchema } from "../../utils/schemas.js";

// 0=Yakshanba..6=Shanba (JS Date#getUTCDay() konventsiyasi)
const daysOfWeekSchema = z
  .array(z.number().int().min(0, "Hafta kuni noto'g'ri").max(6, "Hafta kuni noto'g'ri"))
  .max(7)
  .transform((days) => [...new Set(days)].sort((a, b) => a - b));

const dayOfMonthSchema = z
  .number()
  .int()
  .min(1, "Kun 1 dan 31 gacha bo'lishi kerak")
  .max(31, "Kun 1 dan 31 gacha bo'lishi kerak");

const baseRecurringRuleSchema = z.object({
  goalId: z.string().uuid("Noto'g'ri maqsad ID").optional(),
  amount: amountSchema,
  frequency: z.enum(["weekly", "monthly"]).default("weekly"),
  daysOfWeek: daysOfWeekSchema.optional(),
  dayOfMonth: dayOfMonthSchema.optional(),
  startDate: dateStringSchema,
  endDate: dateStringSchema.optional(),
  comment: commentSchema.optional(),
});

function refineFrequencyAndDates(data, ctx) {
  if (data.frequency === "weekly" && (!data.daysOfWeek || data.daysOfWeek.length === 0)) {
    ctx.addIssue({ code: "custom", message: "Kamida bitta kun tanlanishi kerak", path: ["daysOfWeek"] });
  }
  if (data.frequency === "monthly" && !data.dayOfMonth) {
    ctx.addIssue({ code: "custom", message: "Oyning kuni tanlanishi kerak", path: ["dayOfMonth"] });
  }
  if (data.endDate && data.startDate && data.endDate < data.startDate) {
    ctx.addIssue({
      code: "custom",
      message: "Tugash sanasi boshlanish sanasidan oldin bo'lishi mumkin emas",
      path: ["endDate"],
    });
  }
}

export const createRecurringRuleSchema = baseRecurringRuleSchema.superRefine(refineFrequencyAndDates);

// Qisman yangilash: takrorlanish turi va kunlar mavjud qoida bilan birga
// servisda (recurringRulesService.updateRule) izchillikka tekshiriladi.
export const updateRecurringRuleSchema = z
  .object({
    goalId: z.string().uuid("Noto'g'ri maqsad ID").nullable().optional(),
    amount: amountSchema.optional(),
    frequency: z.enum(["weekly", "monthly"]).optional(),
    daysOfWeek: daysOfWeekSchema.optional(),
    dayOfMonth: dayOfMonthSchema.nullable().optional(),
    startDate: dateStringSchema.optional(),
    endDate: dateStringSchema.nullable().optional(),
    comment: commentSchema.nullable().optional(),
    active: z.boolean().optional(),
  })
  .refine((data) => !data.startDate || !data.endDate || data.endDate >= data.startDate, {
    message: "Tugash sanasi boshlanish sanasidan oldin bo'lishi mumkin emas",
    path: ["endDate"],
  });

export const childIdParamSchema = childIdParamsSchema;

export const ruleIdParamSchema = idParamsSchema;
