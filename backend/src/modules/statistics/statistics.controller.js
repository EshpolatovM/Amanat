import { statisticsService } from "./statistics.service.js";
import { ok } from "../../utils/response.js";

export async function getStatistics(req, res) {
  ok(res, await statisticsService.getStatistics(req.user, req.query));
}

export async function getSummary(req, res) {
  ok(res, await statisticsService.getSummary(req.user, req.query));
}
