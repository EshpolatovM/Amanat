import { tokenService } from "../lib/jwt.js";
import { ApiError } from "../utils/response.js";

export function authenticate(req, res, next) {
  const token = req.cookies?.accessToken;
  if (!token) {
    return next(new ApiError(401, "Avtorizatsiyadan o'tilmagan"));
  }

  try {
    const payload = tokenService.verifyAccessToken(token);
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch {
    next(new ApiError(401, "Token yaroqsiz yoki muddati tugagan"));
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ApiError(403, "Bu amal uchun ruxsat yo'q"));
    }
    next();
  };
}
