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
}

export const env = new AppConfig();
