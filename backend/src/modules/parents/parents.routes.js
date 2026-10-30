import { Router } from "express";
import * as controller from "./parents.controller.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { validateBody } from "../../middleware/validate.js";
import { authenticate, requireRole } from "../../middleware/auth.js";
import { updateParentSchema, changePasswordSchema } from "./parents.schema.js";

export const parentsRouter = Router();

parentsRouter.use(authenticate, requireRole("parent"));

/**
 * @openapi
 * /parents/me:
 *   get:
 *     tags: [Parents]
 *     summary: O'z profilini ko'rish
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       200: { description: Profil ma'lumoti }
 */
parentsRouter.get("/me", asyncHandler(controller.getMe));

/**
 * @openapi
 * /parents/me:
 *   patch:
 *     tags: [Parents]
 *     summary: O'z profilini tahrirlash
 *     security: [{ cookieAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName: { type: string }
 *               lastName: { type: string }
 *               phone: { type: string }
 *     responses:
 *       200: { description: Yangilandi }
 */
parentsRouter.patch("/me", validateBody(updateParentSchema), asyncHandler(controller.updateMe));

/**
 * @openapi
 * /parents/me/password:
 *   patch:
 *     tags: [Parents]
 *     summary: Parolni o'zgartirish
 *     security: [{ cookieAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword: { type: string, format: password }
 *               newPassword: { type: string, format: password }
 *     responses:
 *       200: { description: Parol o'zgartirildi (boshqa qurilmalardagi sessiyalar yopiladi) }
 *       400: { description: Joriy parol noto'g'ri }
 */
parentsRouter.patch("/me/password", validateBody(changePasswordSchema), asyncHandler(controller.changePassword));
