import { Router } from "express";
import * as controller from "./auth.controller.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { validateBody } from "../../middleware/validate.js";
import { authenticate } from "../../middleware/auth.js";
import { parentRegisterSchema, loginSchema } from "./auth.schema.js";

export const authRouter = Router();

/**
 * @openapi
 * /auth/parent/register:
 *   post:
 *     tags: [Auth]
 *     summary: Ota-ona ro'yxatdan o'tishi
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [firstName, lastName, phone, password]
 *             properties:
 *               firstName: { type: string }
 *               lastName: { type: string }
 *               phone: { type: string, example: "+998901234567" }
 *               password: { type: string, format: password }
 *     responses:
 *       201: { description: Ro'yxatdan muvaffaqiyatli o'tildi }
 *       409: { description: Telefon raqami band }
 */
authRouter.post("/parent/register", validateBody(parentRegisterSchema), asyncHandler(controller.registerParent));

/**
 * @openapi
 * /auth/parent/login:
 *   post:
 *     tags: [Auth]
 *     summary: Ota-ona tizimga kirishi
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [phone, password]
 *             properties:
 *               phone: { type: string }
 *               password: { type: string, format: password }
 *     responses:
 *       200: { description: Muvaffaqiyatli kirildi }
 *       401: { description: Telefon raqami yoki parol noto'g'ri }
 */
authRouter.post("/parent/login", validateBody(loginSchema), asyncHandler(controller.loginParent));

/**
 * @openapi
 * /auth/child/login:
 *   post:
 *     tags: [Auth]
 *     summary: Bola tizimga kirishi
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [phone, password]
 *             properties:
 *               phone: { type: string }
 *               password: { type: string, format: password }
 *     responses:
 *       200: { description: Muvaffaqiyatli kirildi }
 *       401: { description: Telefon raqami yoki parol noto'g'ri }
 */
authRouter.post("/child/login", validateBody(loginSchema), asyncHandler(controller.loginChild));

/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Access tokenni refresh token orqali yangilash
 *     responses:
 *       200: { description: Token yangilandi }
 *       401: { description: Refresh token yaroqsiz }
 */
authRouter.post("/refresh", asyncHandler(controller.refresh));

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Tizimdan chiqish
 *     responses:
 *       200: { description: Chiqildi }
 */
authRouter.post("/logout", asyncHandler(controller.logout));

/**
 * @openapi
 * /auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Joriy foydalanuvchi ma'lumoti
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       200: { description: Foydalanuvchi ma'lumoti }
 *       401: { description: Avtorizatsiyadan o'tilmagan }
 */
authRouter.get("/me", authenticate, asyncHandler(controller.me));
