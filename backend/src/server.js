import { app } from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./lib/prisma.js";
import { startScheduledJobs } from "./lib/cron.js";
import { initTelegramBot } from "./lib/telegramBot.js";

let stopScheduledJobs = null;
let bot = null;

const server = app.listen(env.port, () => {
  console.log(`Amanat backend http://localhost:${env.port} portida ishlamoqda`);
  console.log(`Swagger hujjatlari: http://localhost:${env.port}/api-docs`);
  stopScheduledJobs = startScheduledJobs();
  bot = initTelegramBot();
});

// SIGINT/SIGTERM'ga o'z handler'imiz bo'lgani uchun Node endi o'zi chiqmaydi —
// shuning uchun HTTP server, bot, cron va DB ulanishini yopib, o'zimiz chiqamiz
// (aks holda Ctrl+C dan keyin jarayon portni band qilgancha qolib ketardi).
let shuttingDown = false;

async function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`${signal} qabul qilindi — server to'xtatilmoqda...`);

  const forceExit = setTimeout(() => process.exit(1), 10_000);
  forceExit.unref();

  try {
    bot?.stop(signal);
  } catch {
    // bot ishga tushmagan bo'lishi mumkin
  }
  await stopScheduledJobs?.();
  await new Promise((resolve) => server.close(resolve));
  await prisma.$disconnect();
  process.exit(0);
}

process.once("SIGINT", () => shutdown("SIGINT"));
process.once("SIGTERM", () => shutdown("SIGTERM"));
