import { Router } from "express";
import * as controller from "./recurringRules.controller.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { validateBody, validateParams } from "../../middleware/validate.js";
import { authenticate, requireRole } from "../../middleware/auth.js";
import {
  createRecurringRuleSchema,
  updateRecurringRuleSchema,
  childIdParamSchema,
  ruleIdParamSchema,
} from "./recurringRules.schema.js";

export const recurringRulesRouter = Router();

// Bu router "/" ildizida mount qilinadi, shuning uchun `authenticate` har bir
// route'da alohida qo'llaniladi (path-less router.use() dan foydalanilmaydi).

/**
 * @openapi
 * /children/{childId}/recurring-rules:
 *   post:
 *     tags: [RecurringRules]
 *     summary: Avtomatik takrorlanuvchi xarajat qoidasi yaratish (faqat ota-ona)
 *     description: >
 *       `goalId` berilmasa — klassik "kundalik xarajat" (masalan har dush-jumada
 *       10 000 so'm). `goalId` berilsa — shu maqsadga avtomatik to'lov
 *       (masalan "Kurs puli" uchun har oyning 5-sanasida 500 000 so'm).
 *       `frequency: weekly` bo'lsa `daysOfWeek` shart, `frequency: monthly`
 *       bo'lsa `dayOfMonth` shart.
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
 *             required: [amount, startDate]
 *             properties:
 *               goalId: { type: string, description: "Ixtiyoriy — maqsadga bog'lash uchun" }
 *               amount: { type: string, example: "10000" }
 *               frequency: { type: string, enum: [weekly, monthly], default: weekly }
 *               daysOfWeek:
 *                 type: array
 *                 items: { type: integer, minimum: 0, maximum: 6 }
 *                 example: [1, 2, 3, 4, 5]
 *                 description: "frequency=weekly bo'lsa shart"
 *               dayOfMonth: { type: integer, minimum: 1, maximum: 31, description: "frequency=monthly bo'lsa shart" }
 *               startDate: { type: string, example: "2026-09-16" }
 *               endDate: { type: string, example: "2026-12-31" }
 *               comment: { type: string }
 *     responses:
 *       201: { description: Qoida yaratildi }
 */
recurringRulesRouter.post(
  "/children/:childId/recurring-rules",
  authenticate,
  requireRole("parent"),
  validateParams(childIdParamSchema),
  validateBody(createRecurringRuleSchema),
  asyncHandler(controller.createRule),
);

/**
 * @openapi
 * /children/{childId}/recurring-rules:
 *   get:
 *     tags: [RecurringRules]
 *     summary: Bolaning kundalik xarajat qoidalari ro'yxati
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: childId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Qoidalar ro'yxati }
 */
recurringRulesRouter.get(
  "/children/:childId/recurring-rules",
  authenticate,
  validateParams(childIdParamSchema),
  asyncHandler(controller.listRules),
);

/**
 * @openapi
 * /recurring-rules/{id}:
 *   patch:
 *     tags: [RecurringRules]
 *     summary: Qoidani tahrirlash yoki to'xtatish/faollashtirish (faqat ota-ona)
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               goalId: { type: string, nullable: true }
 *               amount: { type: string }
 *               frequency: { type: string, enum: [weekly, monthly] }
 *               daysOfWeek:
 *                 type: array
 *                 items: { type: integer }
 *               dayOfMonth: { type: integer, nullable: true }
 *               startDate: { type: string }
 *               endDate: { type: string, nullable: true }
 *               comment: { type: string }
 *               active: { type: boolean }
 *     responses:
 *       200: { description: Yangilandi }
 */
recurringRulesRouter.patch(
  "/recurring-rules/:id",
  authenticate,
  requireRole("parent"),
  validateParams(ruleIdParamSchema),
  validateBody(updateRecurringRuleSchema),
  asyncHandler(controller.updateRule),
);

/**
 * @openapi
 * /recurring-rules/{id}:
 *   delete:
 *     tags: [RecurringRules]
 *     summary: Qoidani o'chirish (faqat ota-ona)
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: O'chirildi }
 */
recurringRulesRouter.delete(
  "/recurring-rules/:id",
  authenticate,
  requireRole("parent"),
  validateParams(ruleIdParamSchema),
  asyncHandler(controller.deleteRule),
);

/**
 * @openapi
 * /recurring-rules/{id}/instances:
 *   get:
 *     tags: [RecurringRules]
 *     summary: Qoida asosida avtomatik yaratilgan xarajat yozuvlari
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Yozuvlar ro'yxati }
 */
recurringRulesRouter.get(
  "/recurring-rules/:id/instances",
  authenticate,
  validateParams(ruleIdParamSchema),
  asyncHandler(controller.listInstances),
);
