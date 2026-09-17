import { unplannedExpensesService } from "./unplannedExpenses.service.js";
import { ok, created } from "../../utils/response.js";

export async function createUnplannedExpense(req, res) {
  created(res, await unplannedExpensesService.createUnplannedExpense(req.user.id, req.params.childId, req.body));
}

export async function listUnplannedExpenses(req, res) {
  ok(res, await unplannedExpensesService.listUnplannedExpenses(req.user, req.params.childId, req.query));
}

export async function updateUnplannedExpense(req, res) {
  ok(res, await unplannedExpensesService.updateUnplannedExpense(req.user.id, req.params.id, req.body));
}

export async function deleteUnplannedExpense(req, res) {
  ok(res, await unplannedExpensesService.deleteUnplannedExpense(req.user.id, req.params.id));
}
