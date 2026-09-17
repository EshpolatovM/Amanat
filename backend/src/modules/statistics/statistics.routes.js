import { Router } from "express";
import * as controller from "./statistics.controller.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { validateQuery } from "../../middleware/validate.js";
import { authenticate } from "../../middleware/auth.js";
import { statisticsQuerySchema } from "./statistics.schema.js";

export const statisticsRouter = Router();

/**
 * @openapi
 * /statistics:
 *   get:
 *     tags: [Statistics]
 *     summary: Vaqt oralig'ida kategoriya va trend bo'yicha statistika
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
 *         schema: { type: string }
 *       - in: query
 *         name: to
 *         schema: { type: string }
 *     responses:
 *       200: { description: Statistika ma'lumotlari }
 */
statisticsRouter.get("/", authenticate, validateQuery(statisticsQuerySchema), asyncHandler(controller.getStatistics));
