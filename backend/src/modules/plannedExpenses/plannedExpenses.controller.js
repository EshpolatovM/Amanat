import { plannedExpensesService } from "./plannedExpenses.service.js";
import { ok, created } from "../../utils/response.js";

export async function createPlannedExpense(req, res) {
  created(res, await plannedExpensesService.createPlannedExpense(req.user.id, req.params.childId, req.body));
}

export async function listPlannedExpenses(req, res) {
  ok(res, await plannedExpensesService.listPlannedExpenses(req.user, req.params.childId, req.query));
}

export async function updatePlannedExpense(req, res) {
  ok(res, await plannedExpensesService.updatePlannedExpense(req.user.id, req.params.id, req.body));
}

export async function deletePlannedExpense(req, res) {
  ok(res, await plannedExpensesService.deletePlannedExpense(req.user.id, req.params.id));
}
