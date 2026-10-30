import { Router } from "express";
import * as controller from "./statistics.controller.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { validateQuery } from "../../middleware/validate.js";
import { authenticate } from "../../middleware/auth.js";
import { statisticsQuerySchema, statisticsSummaryQuerySchema } from "./statistics.schema.js";

export const statisticsRouter = Router();

/**
 * @openapi
 * /statistics/summary:
 *   get:
 *     tags: [Statistics]
 *     summary: Bugun, shu hafta va shu oy bo'yicha jami xarajatlar (bitta so'rovda)
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: childId
 *         schema: { type: string }
 *         description: Faqat ota-ona uchun; berilmasa barcha bolalar bo'yicha
 *     responses:
 *       200: { description: "{ today, week, month } — har birida from, to, total" }
 */
statisticsRouter.get(
  "/summary",
  authenticate,
  validateQuery(statisticsSummaryQuerySchema),
  asyncHandler(controller.getSummary),
);

/**
 * @openapi
 * /statistics:
 *   get:
 *     tags: [Statistics]
 *     summary: Vaqt oralig'ida kategoriya va trend bo'yicha statistika
 *     description: >
 *       `from`/`to` berilmasa — joriy hafta/oy/yil. Faqat `from` berilsa, shu
 *       sana tushgan davr olinadi (masalan `period=month&from=2026-08-01` —
 *       avgust). Oraliq 62 kundan uzun yoki `period=year` bo'lsa, trend oyma-oy
 *       guruhlanadi (`period.granularity`).
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: period
 *         schema: { type: string, enum: [week, month, year], default: month }
 *       - in: query
 *         name: childId
 *         schema: { type: string }
 *       - in: query
 *         name: from
 *         schema: { type: string, example: "2026-08-01" }
 *       - in: query
 *         name: to
 *         schema: { type: string, example: "2026-08-31" }
 *     responses:
 *       200: { description: Statistika ma'lumotlari }
 */
statisticsRouter.get("/", authenticate, validateQuery(statisticsQuerySchema), asyncHandler(controller.getStatistics));
