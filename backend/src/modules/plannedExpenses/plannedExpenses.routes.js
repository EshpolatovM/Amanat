import { Router } from "express";
import * as controller from "./plannedExpenses.controller.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { validateBody, validateParams, validateQuery } from "../../middleware/validate.js";
import { authenticate, requireRole } from "../../middleware/auth.js";
import {
  createPlannedExpenseSchema,
  updatePlannedExpenseSchema,
  listPlannedExpensesQuerySchema,
  childIdParamSchema,
  expenseIdParamSchema,
} from "./plannedExpenses.schema.js";

export const plannedExpensesRouter = Router();

// Bu router "/" ildizida mount qilinadi, shuning uchun `authenticate` har bir
// route'da alohida qo'llaniladi (path-less router.use() dan foydalanilmaydi).

/**
 * @openapi
 * /children/{childId}/planned-expenses:
 *   post:
 *     tags: [PlannedExpenses]
 *     summary: Maqsadli xarajat kiritish (faqat ota-ona)
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
 *             required: [goalId, amount, date]
 *             properties:
 *               goalId: { type: string }
 *               amount: { type: string, example: "500000" }
 *               date: { type: string, example: "2026-09-16" }
 *               comment: { type: string }
 *     responses:
 *       201: { description: Xarajat yaratildi }
 */
plannedExpensesRouter.post(
  "/children/:childId/planned-expenses",
  authenticate,
  requireRole("parent"),
  validateParams(childIdParamSchema),
  validateBody(createPlannedExpenseSchema),
  asyncHandler(controller.createPlannedExpense),
);

/**
 * @openapi
 * /children/{childId}/planned-expenses:
 *   get:
 *     tags: [PlannedExpenses]
 *     summary: Bolaning maqsadli xarajatlari ro'yxati
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: childId
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: from
 *         schema: { type: string }
 *       - in: query
 *         name: to
 *         schema: { type: string }
 *       - in: query
 *         name: goalId
 *         schema: { type: string }
 *     responses:
 *       200: { description: Xarajatlar ro'yxati }
 */
plannedExpensesRouter.get(
  "/children/:childId/planned-expenses",
  authenticate,
  validateParams(childIdParamSchema),
  validateQuery(listPlannedExpensesQuerySchema),
  asyncHandler(controller.listPlannedExpenses),
);

/**
 * @openapi
 * /planned-expenses/{id}:
 *   patch:
 *     tags: [PlannedExpenses]
 *     summary: Maqsadli xarajatni tahrirlash (faqat ota-ona)
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
 *               goalId: { type: string }
 *               amount: { type: string }
 *               date: { type: string }
 *               comment: { type: string }
 *     responses:
 *       200: { description: Yangilandi }
 */
plannedExpensesRouter.patch(
  "/planned-expenses/:id",
  authenticate,
  requireRole("parent"),
  validateParams(expenseIdParamSchema),
  validateBody(updatePlannedExpenseSchema),
  asyncHandler(controller.updatePlannedExpense),
);

/**
 * @openapi
 * /planned-expenses/{id}:
 *   delete:
 *     tags: [PlannedExpenses]
 *     summary: Maqsadli xarajatni o'chirish (faqat ota-ona)
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: O'chirildi }
 */
plannedExpensesRouter.delete(
  "/planned-expenses/:id",
  authenticate,
  requireRole("parent"),
  validateParams(expenseIdParamSchema),
  asyncHandler(controller.deletePlannedExpense),
);
