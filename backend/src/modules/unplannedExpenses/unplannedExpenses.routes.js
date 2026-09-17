import { Router } from "express";
import * as controller from "./unplannedExpenses.controller.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { validateBody, validateParams, validateQuery } from "../../middleware/validate.js";
import { authenticate, requireRole } from "../../middleware/auth.js";
import {
  createUnplannedExpenseSchema,
  updateUnplannedExpenseSchema,
  listUnplannedExpensesQuerySchema,
  childIdParamSchema,
  expenseIdParamSchema,
} from "./unplannedExpenses.schema.js";

export const unplannedExpensesRouter = Router();

// Bu router "/" ildizida mount qilinadi, shuning uchun `authenticate` har bir
// route'da alohida qo'llaniladi (path-less router.use() dan foydalanilmaydi).

/**
 * @openapi
 * /children/{childId}/unplanned-expenses:
 *   post:
 *     tags: [UnplannedExpenses]
 *     summary: Kutilmagan xarajat kiritish (faqat ota-ona)
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
 *             required: [amount, reason, date]
 *             properties:
 *               amount: { type: string, example: "150000" }
 *               reason: { type: string, example: "Telefon ta'mirlash" }
 *               date: { type: string, example: "2026-09-16" }
 *     responses:
 *       201: { description: Xarajat yaratildi }
 */
unplannedExpensesRouter.post(
  "/children/:childId/unplanned-expenses",
  authenticate,
  requireRole("parent"),
  validateParams(childIdParamSchema),
  validateBody(createUnplannedExpenseSchema),
  asyncHandler(controller.createUnplannedExpense),
);

/**
 * @openapi
 * /children/{childId}/unplanned-expenses:
 *   get:
 *     tags: [UnplannedExpenses]
 *     summary: Bolaning kutilmagan xarajatlari ro'yxati
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
 *     responses:
 *       200: { description: Xarajatlar ro'yxati }
 */
unplannedExpensesRouter.get(
  "/children/:childId/unplanned-expenses",
  authenticate,
  validateParams(childIdParamSchema),
  validateQuery(listUnplannedExpensesQuerySchema),
  asyncHandler(controller.listUnplannedExpenses),
);

/**
 * @openapi
 * /unplanned-expenses/{id}:
 *   patch:
 *     tags: [UnplannedExpenses]
 *     summary: Kutilmagan xarajatni tahrirlash (faqat ota-ona)
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
 *               amount: { type: string }
 *               reason: { type: string }
 *               date: { type: string }
 *     responses:
 *       200: { description: Yangilandi }
 */
unplannedExpensesRouter.patch(
  "/unplanned-expenses/:id",
  authenticate,
  requireRole("parent"),
  validateParams(expenseIdParamSchema),
  validateBody(updateUnplannedExpenseSchema),
  asyncHandler(controller.updateUnplannedExpense),
);

/**
 * @openapi
 * /unplanned-expenses/{id}:
 *   delete:
 *     tags: [UnplannedExpenses]
 *     summary: Kutilmagan xarajatni o'chirish (faqat ota-ona)
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: O'chirildi }
 */
unplannedExpensesRouter.delete(
  "/unplanned-expenses/:id",
  authenticate,
  requireRole("parent"),
  validateParams(expenseIdParamSchema),
  asyncHandler(controller.deleteUnplannedExpense),
);
