import { z } from "zod";
import { dateStringSchema } from "../../utils/date.js";

export const statisticsQuerySchema = z.object({
  period: z.enum(["week", "month", "year"]).optional().default("month"),
  childId: z.string().uuid("Noto'g'ri ID formati").optional(),
  from: dateStringSchema.optional(),
  to: dateStringSchema.optional(),
});
