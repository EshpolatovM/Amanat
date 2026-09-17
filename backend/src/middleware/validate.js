import { ApiError } from "../utils/response.js";

function formatZodError(error) {
  return error.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
  }));
}

export function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return next(new ApiError(400, "Kiritilgan ma'lumot noto'g'ri", formatZodError(result.error)));
    }
    req.body = result.data;
    next();
  };
}

export function validateQuery(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      return next(new ApiError(400, "So'rov parametrlari noto'g'ri", formatZodError(result.error)));
    }
    // Express 5'da req.query faqat getter, shuning uchun to'g'ridan-to'g'ri
    // qayta belgilab bo'lmaydi — xususiyatni qayta aniqlaymiz.
    Object.defineProperty(req, "query", { value: result.data, writable: true, configurable: true });
    next();
  };
}

export function validateParams(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      return next(new ApiError(400, "URL parametrlari noto'g'ri", formatZodError(result.error)));
    }
    req.params = result.data;
    next();
  };
}
