import "dotenv/config";

class AppConfig {
  constructor() {
    this.nodeEnv = process.env.NODE_ENV || "development";
    this.port = Number(process.env.PORT) || 4000;
    this.databaseUrl = this.#required("DATABASE_URL");
    this.jwt = {
      accessSecret: this.#required("JWT_ACCESS_SECRET"),
      refreshSecret: this.#required("JWT_REFRESH_SECRET"),
      accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
      refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
    };
    this.cookieSecure = process.env.COOKIE_SECURE === "true";
    this.corsOrigin = process.env.CORS_ORIGIN || "http://localhost:5173";
    // Reverse-proxy (nginx va h.k.) ortida ishlaganda rate-limit haqiqiy
    // mijoz IP'sini ko'rishi uchun (Express `trust proxy` sozlamasi).
    this.trustProxy = process.env.TRUST_PROXY === "true";
    // "Bugun", joriy hafta/oy va kundalik xarajat generatsiyasi shu vaqt
    // mintaqasidagi kalendar kuni bo'yicha hisoblanadi — server qaysi
    // mintaqada ishlashidan qat'i nazar (auditoriya O'zbekistonda, UTC+5).
    this.appTimezone = this.#timezone(process.env.APP_TIMEZONE || "Asia/Tashkent");
    this.telegram = {
      botToken: process.env.TELEGRAM_BOT_TOKEN || "",
      botUsername: process.env.TELEGRAM_BOT_USERNAME || "",
    };
    this.passwordReset = {
      requestTtlMs: 15 * 60 * 1000,
      otpTtlMs: 5 * 60 * 1000,
      resetTokenTtlMs: 10 * 60 * 1000,
      maxOtpAttempts: 5,
      rateLimitWindowMs: 60 * 1000,
      rateLimitMax: 1,
    };
  }

  #required(name) {
    const value = process.env[name];
    if (!value) {
      throw new Error(`Muhit o'zgaruvchisi topilmadi: ${name}`);
    }
    return value;
  }

  #timezone(value) {
    try {
      new Intl.DateTimeFormat("en-US", { timeZone: value });
    } catch {
      throw new Error(`APP_TIMEZONE noto'g'ri: ${value} (masalan "Asia/Tashkent" bo'lishi kerak)`);
    }
    return value;
  }
}

export const env = new AppConfig();
