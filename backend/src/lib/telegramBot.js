import { Telegraf, Markup } from "telegraf";
import { env } from "../config/env.js";
import { passwordResetService } from "../modules/passwordReset/passwordReset.service.js";

export function initTelegramBot() {
  if (!env.telegram.botToken) {
    console.warn("TELEGRAM_BOT_TOKEN topilmadi — Telegram bot ishga tushmadi");
    return null;
  }

  const bot = new Telegraf(env.telegram.botToken);

  bot.start(async (ctx) => {
    const requestId = ctx.startPayload?.trim();
    if (!requestId) {
      return ctx.reply("Salom! Bu bot Amanat ilovasida ota-ona parolini tiklash uchun ishlatiladi.");
    }

    const result = await passwordResetService.handleBotStart({ requestId, chatId: ctx.chat.id });
    if (!result.ok) {
      return ctx.reply("Havola yaroqsiz yoki muddati tugagan. Saytda parolni tiklashni qaytadan boshlang.");
    }

    return ctx.reply(
      "Parolni tiklash uchun telefon raqamingizni tasdiqlang.",
      Markup.keyboard([Markup.button.contactRequest("📱 Telefon raqamni ulashish")])
        .resize()
        .oneTime(),
    );
  });

  bot.on("contact", async (ctx) => {
    const contact = ctx.message.contact;

    if (contact.user_id && contact.user_id !== ctx.from.id) {
      return ctx.reply("Bu raqam sizga tegishli emas.", Markup.removeKeyboard());
    }

    const result = await passwordResetService.handleContactShared({
      chatId: ctx.chat.id,
      phoneNumber: contact.phone_number,
    });

    if (!result.ok) {
      const messages = {
        phone_mismatch: "Bu raqam saytda kiritilgan raqamga mos kelmadi.",
        not_registered: "Bu raqam bilan Amanat'da ro'yxatdan o'tilmagan.",
        not_found: "So'rov topilmadi yoki muddati tugagan. Saytda qaytadan boshlang.",
      };
      return ctx.reply(messages[result.reason] || messages.not_found, Markup.removeKeyboard());
    }

    return ctx.reply(
      `Tasdiqlash kodingiz: ${result.otp}\n\nBu kodni hech kimga bermang, u 5 daqiqa amal qiladi.`,
      Markup.removeKeyboard(),
    );
  });

  bot.launch();
  console.log(`Telegram bot ishga tushdi: @${env.telegram.botUsername}`);

  process.once("SIGINT", () => bot.stop("SIGINT"));
  process.once("SIGTERM", () => bot.stop("SIGTERM"));

  return bot;
}
