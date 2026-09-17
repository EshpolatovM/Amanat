import { passwordResetService } from "./passwordReset.service.js";
import { ok, created } from "../../utils/response.js";

export async function startReset(req, res) {
  const result = await passwordResetService.start(req.body);
  created(res, result);
}

export async function getResetStatus(req, res) {
  const result = await passwordResetService.getStatus(req.params.requestId);
  ok(res, result);
}

export async function verifyResetOtp(req, res) {
  const result = await passwordResetService.verifyOtp({
    requestId: req.params.requestId,
    otp: req.body.otp,
  });
  ok(res, result);
}

export async function confirmReset(req, res) {
  const result = await passwordResetService.confirm(req.body);
  ok(res, result);
}
