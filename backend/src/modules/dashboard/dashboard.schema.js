import { z } from "zod";

export const dashboardQuerySchema = z.object({
  childId: z.string().uuid("Noto'g'ri ID formati").optional(),
});
