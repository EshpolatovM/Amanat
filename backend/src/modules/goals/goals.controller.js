import { goalsService } from "./goals.service.js";
import { ok, created } from "../../utils/response.js";

export async function createGoal(req, res) {
  created(res, await goalsService.createGoal(req.user.id, req.params.childId, req.body));
}

export async function listGoals(req, res) {
  ok(res, await goalsService.listGoals(req.user, req.params.childId));
}

export async function updateGoal(req, res) {
  ok(res, await goalsService.updateGoal(req.user.id, req.params.id, req.body));
}

export async function deleteGoal(req, res) {
  ok(res, await goalsService.deleteGoal(req.user.id, req.params.id));
}
