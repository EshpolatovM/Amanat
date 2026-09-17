import { Router } from "express";
import * as controller from "./dashboard.controller.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { validateQuery } from "../../middleware/validate.js";
import { authenticate } from "../../middleware/auth.js";
import { dashboardQuerySchema } from "./dashboard.schema.js";

export const dashboardRouter = Router();

/**
 * @openapi
 * /dashboard:
 *   get:
 *     tags: [Dashboard]
 *     summary: Joriy oy bo'yicha umumiy ko'rinish
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: childId
 *         schema: { type: string }
 *         description: Faqat ota-ona uchun; berilmasa barcha bolalar bo'yicha umumlashtiriladi
 *     responses:
 *       200: { description: Dashboard ma'lumotlari }
 */
dashboardRouter.get("/", authenticate, validateQuery(dashboardQuerySchema), asyncHandler(controller.getDashboard));
