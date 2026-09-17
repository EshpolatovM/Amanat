import { dashboardService } from "./dashboard.service.js";
import { ok } from "../../utils/response.js";

export async function getDashboard(req, res) {
  ok(res, await dashboardService.getDashboard(req.user, req.query));
}
