import cron from "node-cron";
import { env } from "../config/env.js";
import { prisma } from "./prisma.js";
import { recurringRulesService } from "../modules/recurringRules/recurringRules.service.js";
import { passwordResetService } from "../modules/passwordReset/passwordReset.service.js";

const DAY_MS = 24 * 60 * 60 * 1000;

function generateRecurringExpenses() {
  return recurringRulesService
    .generateAllDueInstances()
    .catch((err) => console.error("Kundalik xarajat generatsiyasi xatoligi:", err));
}

// Muddati o'tgan/bekor qilingan refresh tokenlar va eski parol tiklash
// so'rovlari jadvallarni cheksiz o'stirmasligi uchun.
async function cleanupStaleRecords() {
  try {
    const { count: tokens } = await prisma.refreshToken.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } },
          { revokedAt: { lt: new Date(Date.now() - 7 * DAY_MS) } },
        ],
      },
    });
    const resetRequests = await passwordResetService.deleteStaleRequests();
    if (tokens || resetRequests) {
      console.log(`Tozalash: ${tokens} ta eski token, ${resetRequests} ta parol tiklash so'rovi o'chirildi`);
    }
  } catch (err) {
    console.error("Eski yozuvlarni tozalash xatoligi:", err);
  }
}

// Qaytaradi: barcha rejalashtirilgan vazifalarni to'xtatuvchi funksiya (graceful shutdown uchun).
export function startScheduledJobs() {
  // Server ishga tushganda o'tkazib yuborilgan kunlarni to'ldirish
  generateRecurringExpenses();

  const options = { timezone: env.appTimezone, noOverlap: true };
  const tasks = [
    // Har kuni ilova vaqti bilan 00:05 da shu kunning avtomatik xarajatlarini yaratish
    cron.schedule("5 0 * * *", generateRecurringExpenses, options),
    cron.schedule("30 3 * * *", cleanupStaleRecords, options),
  ];

  return () => Promise.all(tasks.map((task) => task.stop()));
}
