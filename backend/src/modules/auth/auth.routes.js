import { Router } from "express";
import * as controller from "./auth.controller.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { validateBody } from "../../middleware/validate.js";
import { authenticate } from "../../middleware/auth.js";
import { rateLimit, loginIdentifierKey } from "../../middleware/rateLimit.js";
import { parentRegisterSchema, loginSchema } from "./auth.schema.js";

export const authRouter = Router();

const FIFTEEN_MINUTES = 15 * 60 * 1000;

// Parolni taxmin qilib topishdan (brute-force) himoya — uch qatlam:
// bitta IP'dan umumiy, bitta IP'dan bitta akkauntga va (turli IP'lardan) bitta
// akkauntga. Mobil operatorlarda ko'p foydalanuvchi bitta IP'ni bo'lishgani
// uchun IP chegarasi ataylab kengroq qo'yilgan.
function loginLimiters() {
  return [
    rateLimit({ windowMs: FIFTEEN_MINUTES, max: 100 }),
    rateLimit({
      windowMs: FIFTEEN_MINUTES,
      max: 10,
      keyGenerator: (req) => {
        const identifier = loginIdentifierKey(req);
        return identifier && `${req.ip}:${identifier}`;
      },
    }),
    rateLimit({ windowMs: FIFTEEN_MINUTES, max: 30, keyGenerator: loginIdentifierKey }),
  ];
}

const registerLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 20 });

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
 *       429: { description: Juda ko'p urinish }
 */
authRouter.post(
  "/parent/register",
  registerLimiter,
  validateBody(parentRegisterSchema),
  asyncHandler(controller.registerParent),
);

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
 *       429: { description: Juda ko'p urinish }
 */
authRouter.post("/parent/login", ...loginLimiters(), validateBody(loginSchema), asyncHandler(controller.loginParent));

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
 *       401: { description: Kirish ID yoki parol noto'g'ri }
 *       429: { description: Juda ko'p urinish }
 */
authRouter.post("/child/login", ...loginLimiters(), validateBody(loginSchema), asyncHandler(controller.loginChild));

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
