import { z } from "zod";
import { dateStringSchema } from "../../utils/date.js";

const MAX_RANGE_DAYS = 731;
const DAY_MS = 24 * 60 * 60 * 1000;

export const statisticsQuerySchema = z
  .object({
    period: z.enum(["week", "month", "year"]).optional().default("month"),
    childId: z.string().uuid("Noto'g'ri ID formati").optional(),
    from: dateStringSchema.optional(),
    to: dateStringSchema.optional(),
  })
  .refine((q) => !q.from || !q.to || q.from <= q.to, {
    message: "Boshlanish sanasi tugash sanasidan keyin bo'lishi mumkin emas",
    path: ["from"],
  })
  .refine((q) => !q.from || !q.to || (q.to - q.from) / DAY_MS <= MAX_RANGE_DAYS, {
    message: "Oraliq 2 yildan oshmasligi kerak",
    path: ["to"],
  });

export const statisticsSummaryQuerySchema = z.object({
  childId: z.string().uuid("Noto'g'ri ID formati").optional(),
});
