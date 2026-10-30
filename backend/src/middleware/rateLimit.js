import { ApiError } from "../utils/response.js";

function formatWait(seconds) {
  if (seconds < 60) return `${seconds} soniya`;
  return `${Math.ceil(seconds / 60)} daqiqa`;
}

// Xotiradagi (in-memory) fixed-window rate limiter. Bitta server jarayoni
// uchun yetarli; bir nechta instansiyaga kengaytirilsa, hisoblagichlarni
// Redis kabi umumiy saqlovchiga ko'chirish kerak bo'ladi.
//
// `keyGenerator` null qaytarsa, so'rov cheklanmaydi (masalan kalit uchun
// kerakli maydon yo'q — validatsiya baribir rad etadi).
export function rateLimit({ windowMs, max, keyGenerator = (req) => req.ip }) {
  const hits = new Map();

  const cleanup = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of hits) {
      if (entry.resetAt <= now) hits.delete(key);
    }
  }, windowMs);
  cleanup.unref();

  return (req, res, next) => {
    const key = keyGenerator(req);
    if (key === null || key === undefined) return next();

    const now = Date.now();
    let entry = hits.get(key);
    if (!entry || entry.resetAt <= now) {
      entry = { count: 0, resetAt: now + windowMs };
      hits.set(key, entry);
    }

    entry.count += 1;
    if (entry.count > max) {
      const retryAfterSeconds = Math.max(1, Math.ceil((entry.resetAt - now) / 1000));
      res.set("Retry-After", String(retryAfterSeconds));
      return next(
        new ApiError(429, `Juda ko'p urinish. ${formatWait(retryAfterSeconds)}dan so'ng qayta urinib ko'ring`),
      );
    }

    next();
  };
}

// Login identifikatori (telefon yoki Kirish ID) bo'yicha kalit: faqat
// raqamlar, oxirgi 9 tasi — "+998901234567" va "901234567" bir xil kalitga tushadi.
export function loginIdentifierKey(req) {
  const digits = String(req.body?.phone ?? "").replace(/\D/g, "");
  return digits ? digits.slice(-9) : null;
}
