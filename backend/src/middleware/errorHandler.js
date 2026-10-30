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

  // express.json() xatoliklari: buzilgan JSON yoki juda katta so'rov tanasi
  if (err?.type === "entity.parse.failed") {
    return res.status(400).json({
      success: false,
      error: { message: "So'rov tanasi (JSON) noto'g'ri formatda" },
    });
  }
  if (err?.type === "entity.too.large") {
    return res.status(413).json({
      success: false,
      error: { message: "So'rov hajmi juda katta" },
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

  // body-parser / http-errors kabi kutubxonalarning mijoz xatoliklari (4xx)
  if (Number.isInteger(err?.status) && err.status >= 400 && err.status < 500) {
    return res.status(err.status).json({
      success: false,
      error: { message: "So'rov noto'g'ri" },
    });
  }

  console.error(err);
  return res.status(500).json({
    success: false,
    error: { message: "Server xatoligi yuz berdi" },
  });
}
