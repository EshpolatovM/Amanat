import { parentsService } from "./parents.service.js";
import { ok } from "../../utils/response.js";

export async function getMe(req, res) {
  ok(res, await parentsService.getProfile(req.user.id));
}

export async function updateMe(req, res) {
  ok(res, await parentsService.updateProfile(req.user.id, req.body));
}

export async function changePassword(req, res) {
  ok(res, await parentsService.changePassword(req.user.id, req.body, req.cookies?.refreshToken));
}
