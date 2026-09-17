import { recurringRulesService } from "./recurringRules.service.js";
import { ok, created } from "../../utils/response.js";

export async function createRule(req, res) {
  created(res, await recurringRulesService.createRule(req.user.id, req.params.childId, req.body));
}

export async function listRules(req, res) {
  ok(res, await recurringRulesService.listRules(req.user, req.params.childId));
}

export async function updateRule(req, res) {
  ok(res, await recurringRulesService.updateRule(req.user.id, req.params.id, req.body));
}

export async function deleteRule(req, res) {
  ok(res, await recurringRulesService.deleteRule(req.user.id, req.params.id));
}

export async function listInstances(req, res) {
  ok(res, await recurringRulesService.listInstances(req.user, req.params.id));
}
