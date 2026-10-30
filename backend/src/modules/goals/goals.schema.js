import { z } from "zod";
import { idParamsSchema, childIdParamsSchema } from "../../utils/schemas.js";

const goalNameSchema = z
  .string()
  .trim()
  .min(1, "Maqsad nomi kiritilishi shart")
  .max(60, "Maqsad nomi 60 belgidan oshmasligi kerak");

export const createGoalSchema = z.object({
  name: goalNameSchema,
});

export const updateGoalSchema = z.object({
  name: goalNameSchema,
});

export const childIdParamSchema = childIdParamsSchema;

export const goalIdParamSchema = idParamsSchema;
