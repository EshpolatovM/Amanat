import { childrenService } from "./children.service.js";
import { ok, created } from "../../utils/response.js";

export async function createChild(req, res) {
  created(res, await childrenService.createChild(req.user.id, req.body));
}

export async function listChildren(req, res) {
  ok(res, await childrenService.listChildren(req.user.id));
}

export async function getChild(req, res) {
  ok(res, await childrenService.getChild(req.user, req.params.id));
}

export async function updateChild(req, res) {
  ok(res, await childrenService.updateChild(req.user.id, req.params.id, req.body));
}

export async function deleteChild(req, res) {
  ok(res, await childrenService.deleteChild(req.user.id, req.params.id));
}

export async function resetChildPassword(req, res) {
  ok(res, await childrenService.resetChildPassword(req.user.id, req.params.id, req.body.newPassword));
}
