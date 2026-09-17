import { ApiError } from "../utils/response.js";

export function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: { message: "Endpoint topilmadi", path: req.originalUrl },
  });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  if (err instanceof ApiError) {
    return res.status(err.status).json({
      success: false,
      error: { message: err.message, details: err.details },
    });
  }

  if (err?.code === "P2002") {
    return res.status(409).json({
      success: false,
      error: { message: "Bu qiymat allaqachon mavjud", details: err.meta?.target },
    });
  }

  // Prisma "onDelete: Restrict" holatida DB darajasidagi RESTRICT xatoligini
  // har doim ham P2003 kodi bilan qaytiravermaydi (masalan to'g'ridan-to'g'ri
  // Postgres RESTRICT triggeri PrismaClientUnknownRequestError sifatida keladi) —
  // shuning uchun xabar matni bo'yicha ham tekshiramiz.
  if (err?.code === "P2003" || /foreign key constraint/i.test(err?.message || "")) {
    return res.status(409).json({
      success: false,
      error: { message: "Bu yozuvga bog'liq boshqa ma'lumotlar mavjud, avval ularni o'chiring" },
    });
  }

  if (err?.code === "P2025") {
    return res.status(404).json({
      success: false,
      error: { message: "Yozuv topilmadi" },
    });
  }

  if (err?.name === "JsonWebTokenError" || err?.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      error: { message: "Token yaroqsiz yoki muddati tugagan" },
    });
  }

  console.error(err);
  return res.status(500).json({
    success: false,
    error: { message: "Server xatoligi yuz berdi" },
  });
}
