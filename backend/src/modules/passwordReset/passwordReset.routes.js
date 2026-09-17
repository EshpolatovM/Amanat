import { Router } from "express";
import * as controller from "./passwordReset.controller.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { validateBody, validateParams } from "../../middleware/validate.js";
import {
  startResetSchema,
  requestIdParamsSchema,
  verifyOtpSchema,
  confirmResetSchema,
} from "./passwordReset.schema.js";

export const passwordResetRouter = Router();

/**
 * @openapi
 * /auth/parent/password-reset/start:
 *   post:
 *     tags: [Auth]
 *     summary: Telegram bot orqali parolni tiklashni boshlash
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [phone]
 *             properties:
 *               phone: { type: string, example: "+998901234567" }
 *     responses:
 *       201: { description: So'rov yaratildi, Telegram bot havolasi qaytariladi }
 *       429: { description: Juda ko'p so'rov yuborildi }
 */
passwordResetRouter.post("/start", validateBody(startResetSchema), asyncHandler(controller.startReset));

/**
 * @openapi
 * /auth/parent/password-reset/{requestId}/status:
 *   get:
 *     tags: [Auth]
 *     summary: Parolni tiklash so'rovi holatini tekshirish (frontend polling uchun)
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Joriy holat }
 *       404: { description: So'rov topilmadi }
 *       410: { description: So'rov muddati tugagan }
 */
passwordResetRouter.get(
  "/:requestId/status",
  validateParams(requestIdParamsSchema),
  asyncHandler(controller.getResetStatus),
);

/**
 * @openapi
 * /auth/parent/password-reset/{requestId}/verify:
 *   post:
 *     tags: [Auth]
 *     summary: Telegram orqali yuborilgan bir martalik kodni tasdiqlash
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [otp]
 *             properties:
 *               otp: { type: string, example: "123456" }
 *     responses:
 *       200: { description: Kod to'g'ri, vaqtinchalik reset-token qaytariladi }
 *       400: { description: Kod noto'g'ri yoki muddati tugagan }
 *       429: { description: Urinishlar soni tugadi }
 */
passwordResetRouter.post(
  "/:requestId/verify",
  validateParams(requestIdParamsSchema),
  validateBody(verifyOtpSchema),
  asyncHandler(controller.verifyResetOtp),
);

/**
 * @openapi
 * /auth/parent/password-reset/confirm:
 *   post:
 *     tags: [Auth]
 *     summary: Reset-token bilan yangi parol o'rnatish
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [requestId, resetToken, newPassword]
 *             properties:
 *               requestId: { type: string }
 *               resetToken: { type: string }
 *               newPassword: { type: string, format: password }
 *     responses:
 *       200: { description: Parol muvaffaqiyatli yangilandi }
 *       400: { description: Token noto'g'ri yoki muddati tugagan }
 */
passwordResetRouter.post("/confirm", validateBody(confirmResetSchema), asyncHandler(controller.confirmReset));
