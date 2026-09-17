import cron from "node-cron";
import { recurringRulesService } from "../modules/recurringRules/recurringRules.service.js";

export function startRecurringExpensesCron() {
  // Server ishga tushganda o'tkazib yuborilgan kunlarni to'ldirish
  recurringRulesService
    .generateAllDueInstances()
    .catch((err) => console.error("Kundalik xarajat generatsiyasi xatoligi:", err));

  // Har kuni yarim kechadan keyin (00:05) shu kunning avtomatik xarajatlarini yaratish
  cron.schedule("5 0 * * *", () => {
    recurringRulesService
      .generateAllDueInstances()
      .catch((err) => console.error("Kundalik xarajat generatsiyasi xatoligi:", err));
  });
}
