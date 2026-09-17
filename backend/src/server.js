import { app } from "./app.js";
import { env } from "./config/env.js";
import { startRecurringExpensesCron } from "./lib/cron.js";
import { initTelegramBot } from "./lib/telegramBot.js";

app.listen(env.port, () => {
  console.log(`Amanat backend http://localhost:${env.port} portida ishlamoqda`);
  console.log(`Swagger hujjatlari: http://localhost:${env.port}/api-docs`);
  startRecurringExpensesCron();
  initTelegramBot();
});
