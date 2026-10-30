import { Telegraf, Markup } from "telegraf";
import { env } from "../config/env.js";
import { passwordResetService } from "../modules/passwordReset/passwordReset.service.js";

const SHARE_BUTTON_TEXT = "📱 Telefon raqamni ulashish";

function contactKeyboard() {
  return Markup.keyboard([Markup.button.contactRequest(SHARE_BUTTON_TEXT)])
    .resize()
    .oneTime();
}

export function initTelegramBot() {
  if (!env.telegram.botToken) {
    console.warn("TELEGRAM_BOT_TOKEN topilmadi — Telegram bot ishga tushmadi");
    return null;
  }
  if (!env.telegram.botUsername) {
    console.warn("TELEGRAM_BOT_USERNAME topilmadi — parolni tiklash havolasi yaratilmaydi");
  }

  const bot = new Telegraf(env.telegram.botToken);

  bot.start(async (ctx) => {
    if (ctx.chat.type !== "private") return;

    const requestId = ctx.startPayload?.trim();
    if (!requestId) {
      return ctx.reply("Salom! Bu bot Amanat ilovasida ota-ona parolini tiklash uchun ishlatiladi.");
    }

    const result = await passwordResetService.handleBotStart({ requestId, chatId: ctx.chat.id });
    if (!result.ok) {
      return ctx.reply("Havola yaroqsiz yoki muddati tugagan. Saytda parolni tiklashni qaytadan boshlang.");
    }

    return ctx.reply(
      `Parolni tiklash uchun pastdagi «${SHARE_BUTTON_TEXT}» tugmasini bosib, raqamingizni tasdiqlang.`,
      contactKeyboard(),
    );
  });

  bot.on("contact", async (ctx) => {
    const contact = ctx.message.contact;

    // Faqat tugma orqali yuborilgan, foydalanuvchining O'Z raqami qabul qilinadi.
    // Telefon kitobidan ulashilgan begona kontaktda `user_id` bo'lmaydi (yoki
    // boshqa odamniki bo'ladi) — uni qabul qilsak, istalgan raqam egasining
    // parolini tiklab, akkauntini egallab olish mumkin bo'lardi.
    if (contact.user_id !== ctx.from.id) {
      return ctx.reply(
        `Faqat o'z raqamingizni «${SHARE_BUTTON_TEXT}» tugmasi orqali yuborishingiz mumkin.`,
        contactKeyboard(),
      );
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

    const minutes = Math.round(env.passwordReset.otpTtlMs / 60000);
    return ctx.reply(
      `Tasdiqlash kodingiz: ${result.otp}\n\nBu kodni hech kimga bermang, u ${minutes} daqiqa amal qiladi.`,
      Markup.removeKeyboard(),
    );
  });

  // Bitta xabarni qayta ishlashdagi xatolik (masalan DB vaqtincha ishlamasa)
  // butun botni to'xtatib qo'ymasligi uchun — Telegraf'ning standart
  // handleError'i xatoni qayta otadi va long polling butunlay to'xtaydi.
  bot.catch(async (err, ctx) => {
    console.error("Telegram bot xatoligi:", err);
    try {
      await ctx.reply("Xatolik yuz berdi. Birozdan so'ng qayta urinib ko'ring.");
    } catch {
      // javob yuborib bo'lmasa — e'tiborsiz qoldiramiz
    }
  });

  bot
    .launch(() => {
      console.log(`Telegram bot ishga tushdi: @${bot.botInfo?.username ?? env.telegram.botUsername}`);
    })
    .catch((err) => {
      console.error("Telegram bot ishga tushmadi:", err.message);
    });

  return bot;
}
