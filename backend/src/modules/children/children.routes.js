import { Router } from "express";
import * as controller from "./children.controller.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { validateBody, validateParams } from "../../middleware/validate.js";
import { authenticate, requireRole } from "../../middleware/auth.js";
import {
  createChildSchema,
  updateChildSchema,
  resetChildPasswordSchema,
  childIdParamSchema,
} from "./children.schema.js";

export const childrenRouter = Router();

// Diqqat: bu router boshqa modul routerlari bilan birga "/" ildizida mount
// qilinadi (routes/index.js), shuning uchun `router.use(authenticate)` kabi
// yo'lsiz (path-less) middleware ishlatilmaydi — u shu routerdan o'tuvchi
// BARCHA so'rovlarga (hatto mos kelmagan/404 bo'ladigan yo'llarga ham)
// taalluqli bo'lib qolar edi. Shuning uchun `authenticate` har bir route'da
// alohida qo'llaniladi.

/**
 * @openapi
 * /children:
 *   post:
 *     tags: [Children]
 *     summary: Yangi bola profili qo'shish (faqat ota-ona)
 *     security: [{ cookieAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [firstName, lastName, age, phone, password]
 *             properties:
 *               firstName: { type: string }
 *               lastName: { type: string }
 *               age: { type: integer }
 *               phone: { type: string }
 *               password: { type: string, format: password }
 *     responses:
 *       201: { description: Bola qo'shildi }
 */
childrenRouter.post(
  "/children",
  authenticate,
  requireRole("parent"),
  validateBody(createChildSchema),
  asyncHandler(controller.createChild),
);

/**
 * @openapi
 * /children:
 *   get:
 *     tags: [Children]
 *     summary: Ota-onaning barcha bolalari ro'yxati
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       200: { description: Bolalar ro'yxati }
 */
childrenRouter.get("/children", authenticate, requireRole("parent"), asyncHandler(controller.listChildren));

/**
 * @openapi
 * /children/{id}:
 *   get:
 *     tags: [Children]
 *     summary: Bola profili (ota-ona o'ziniki, bola faqat o'zinikini)
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Bola ma'lumoti }
 *       403: { description: Ruxsat yo'q }
 *       404: { description: Topilmadi }
 */
childrenRouter.get(
  "/children/:id",
  authenticate,
  validateParams(childIdParamSchema),
  asyncHandler(controller.getChild),
);

/**
 * @openapi
 * /children/{id}:
 *   patch:
 *     tags: [Children]
 *     summary: Bola profilini tahrirlash (faqat ota-ona)
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
 *               firstName: { type: string }
 *               lastName: { type: string }
 *               age: { type: integer }
 *               phone: { type: string }
 *     responses:
 *       200: { description: Yangilandi }
 */
childrenRouter.patch(
  "/children/:id",
  authenticate,
  requireRole("parent"),
  validateParams(childIdParamSchema),
  validateBody(updateChildSchema),
  asyncHandler(controller.updateChild),
);

/**
 * @openapi
 * /children/{id}:
 *   delete:
 *     tags: [Children]
 *     summary: Bola profilini o'chirish (faqat ota-ona)
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: O'chirildi }
 */
childrenRouter.delete(
  "/children/:id",
  authenticate,
  requireRole("parent"),
  validateParams(childIdParamSchema),
  asyncHandler(controller.deleteChild),
);

/**
 * @openapi
 * /children/{id}/password:
 *   patch:
 *     tags: [Children]
 *     summary: Bola parolini o'zgartirish (faqat ota-ona)
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
 *             required: [newPassword]
 *             properties:
 *               newPassword: { type: string, format: password }
 *     responses:
 *       200: { description: Parol o'zgartirildi }
 */
childrenRouter.patch(
  "/children/:id/password",
  authenticate,
  requireRole("parent"),
  validateParams(childIdParamSchema),
  validateBody(resetChildPasswordSchema),
  asyncHandler(controller.resetChildPassword),
);
