import { Router } from "express";
import * as controller from "./goals.controller.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { validateBody, validateParams } from "../../middleware/validate.js";
import { authenticate, requireRole } from "../../middleware/auth.js";
import { createGoalSchema, updateGoalSchema, childIdParamSchema, goalIdParamSchema } from "./goals.schema.js";

export const goalsRouter = Router();

// Bu router "/" ildizida boshqa modul routerlari bilan mount qilinadi,
// shuning uchun path-less `router.use(authenticate)` ishlatilmaydi (bo'lmasa
// mos kelmagan yo'llar ham 404 o'rniga 401 qaytarib qoladi) — har bir route'da
// alohida qo'llaniladi.

/**
 * @openapi
 * /children/{childId}/goals:
 *   post:
 *     tags: [Goals]
 *     summary: Bola uchun yangi maqsad yaratish (faqat ota-ona)
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: childId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string, example: "Kurs puli" }
 *     responses:
 *       201: { description: Maqsad yaratildi }
 *       409: { description: Bu nomdagi maqsad allaqachon mavjud }
 */
goalsRouter.post(
  "/children/:childId/goals",
  authenticate,
  requireRole("parent"),
  validateParams(childIdParamSchema),
  validateBody(createGoalSchema),
  asyncHandler(controller.createGoal),
);

/**
 * @openapi
 * /children/{childId}/goals:
 *   get:
 *     tags: [Goals]
 *     summary: Bolaning maqsadlari ro'yxati
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: childId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Maqsadlar ro'yxati (har birida usageCount — bog'langan yozuvlar soni) }
 */
goalsRouter.get(
  "/children/:childId/goals",
  authenticate,
  validateParams(childIdParamSchema),
  asyncHandler(controller.listGoals),
);

/**
 * @openapi
 * /goals/{id}:
 *   patch:
 *     tags: [Goals]
 *     summary: Maqsadni tahrirlash (faqat ota-ona)
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string }
 *     responses:
 *       200: { description: Yangilandi }
 *       409: { description: Bu nomdagi maqsad allaqachon mavjud }
 */
goalsRouter.patch(
  "/goals/:id",
  authenticate,
  requireRole("parent"),
  validateParams(goalIdParamSchema),
  validateBody(updateGoalSchema),
  asyncHandler(controller.updateGoal),
);

/**
 * @openapi
 * /goals/{id}:
 *   delete:
 *     tags: [Goals]
 *     summary: Maqsadni o'chirish (faqat ota-ona)
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: O'chirildi }
 *       409: { description: Bu maqsadga bog'liq xarajatlar mavjud }
 */
goalsRouter.delete(
  "/goals/:id",
  authenticate,
  requireRole("parent"),
  validateParams(goalIdParamSchema),
  asyncHandler(controller.deleteGoal),
);
