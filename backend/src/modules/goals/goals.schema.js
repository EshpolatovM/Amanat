import { z } from "zod";

export const createGoalSchema = z.object({
  name: z.string().trim().min(1, "Maqsad nomi kiritilishi shart"),
});

export const updateGoalSchema = z.object({
  name: z.string().trim().min(1, "Maqsad nomi kiritilishi shart"),
});

export const childIdParamSchema = z.object({
  childId: z.string().uuid("Noto'g'ri ID formati"),
});

export const goalIdParamSchema = z.object({
  id: z.string().uuid("Noto'g'ri ID formati"),
});
