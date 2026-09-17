import { Router } from "express";
import { authRouter } from "../modules/auth/auth.routes.js";
import { passwordResetRouter } from "../modules/passwordReset/passwordReset.routes.js";
import { parentsRouter } from "../modules/parents/parents.routes.js";
import { childrenRouter } from "../modules/children/children.routes.js";
import { goalsRouter } from "../modules/goals/goals.routes.js";
import { plannedExpensesRouter } from "../modules/plannedExpenses/plannedExpenses.routes.js";
import { recurringRulesRouter } from "../modules/recurringRules/recurringRules.routes.js";
import { unplannedExpensesRouter } from "../modules/unplannedExpenses/unplannedExpenses.routes.js";
import { dashboardRouter } from "../modules/dashboard/dashboard.routes.js";
import { statisticsRouter } from "../modules/statistics/statistics.routes.js";

export const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/auth/parent/password-reset", passwordResetRouter);
apiRouter.use("/parents", parentsRouter);
apiRouter.use("/", childrenRouter);
apiRouter.use("/", goalsRouter);
apiRouter.use("/", plannedExpensesRouter);
apiRouter.use("/", recurringRulesRouter);
apiRouter.use("/", unplannedExpensesRouter);
apiRouter.use("/dashboard", dashboardRouter);
apiRouter.use("/statistics", statisticsRouter);
