import { prisma } from "../../lib/prisma.js";
import { accessControlService } from "../../lib/access.js";
import { periodRange, toDateOnlyString } from "../../utils/date.js";
import { recurringRulesService } from "../recurringRules/recurringRules.service.js";

export class StatisticsService {
  #sumAmount(rows) {
    return rows.reduce((acc, row) => acc + row.amount, 0n);
  }

  #buildTrend(period, from, to, rows) {
    const buckets = new Map();

    if (period === "year") {
      for (let m = 0; m < 12; m++) {
        const key = `${from.getUTCFullYear()}-${String(m + 1).padStart(2, "0")}`;
        buckets.set(key, 0n);
      }
      for (const row of rows) {
        const d = new Date(row.date);
        const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
        buckets.set(key, (buckets.get(key) || 0n) + row.amount);
      }
    } else {
      const cursor = new Date(from);
      while (cursor <= to) {
        buckets.set(toDateOnlyString(cursor), 0n);
        cursor.setUTCDate(cursor.getUTCDate() + 1);
      }
      for (const row of rows) {
        const key = toDateOnlyString(row.date);
        if (buckets.has(key)) {
          buckets.set(key, (buckets.get(key) || 0n) + row.amount);
        }
      }
    }

    return Array.from(buckets.entries()).map(([bucket, total]) => ({ bucket, total }));
  }

  // Davr ichidagi eng katta bitta xarajat yozuvi (turi va nomi bilan) —
  // Statistika sahifasidagi "Eng katta xarajat" ko'rsatkichi uchun.
  #findTopExpense(plannedExpenses, recurringInstances, unplannedExpenses) {
    const candidates = [
      ...plannedExpenses.map((e) => ({ type: "planned", label: e.goal.name, amount: e.amount, date: e.date })),
      ...recurringInstances.map((e) => ({
        type: e.goalId ? "planned" : "recurring",
        label: e.goal ? e.goal.name : "Kundalik xarajat",
        amount: e.amount,
        date: e.date,
      })),
      ...unplannedExpenses.map((e) => ({ type: "unplanned", label: e.reason, amount: e.amount, date: e.date })),
    ];

    return candidates.reduce((top, current) => (!top || current.amount > top.amount ? current : top), null);
  }

  async getStatistics(user, query) {
    const childIds = await accessControlService.resolveChildScope(user, query.childId);

    const { from, to } =
      query.from || query.to
        ? { from: query.from ?? periodRange(query.period).from, to: query.to ?? periodRange(query.period).to }
        : periodRange(query.period);

    await recurringRulesService.generateDueInstancesForChildren(childIds, new Date());

    const [plannedExpenses, recurringInstances, unplannedExpenses] = await Promise.all([
      prisma.plannedExpense.findMany({
        where: { childId: { in: childIds }, date: { gte: from, lte: to } },
        include: { goal: true },
      }),
      prisma.recurringExpenseInstance.findMany({
        where: { childId: { in: childIds }, date: { gte: from, lte: to } },
        include: { goal: true },
      }),
      prisma.unplannedExpense.findMany({
        where: { childId: { in: childIds }, date: { gte: from, lte: to } },
      }),
    ]);

    // Maqsadga bog'langan (goalId bor) avtomatik yozuvlar "Maqsadli xarajat"ga
    // qo'shiladi (masalan "Kurs puli — har oyning 5-sanasida"); maqsadsizlari
    // esa klassik "Kundalik xarajat" sifatida qoladi.
    const goalLinkedInstances = recurringInstances.filter((e) => e.goalId);
    const pureRecurringInstances = recurringInstances.filter((e) => !e.goalId);

    const plannedTotal = this.#sumAmount(plannedExpenses) + this.#sumAmount(goalLinkedInstances);
    const recurringTotal = this.#sumAmount(pureRecurringInstances);
    const unplannedTotal = this.#sumAmount(unplannedExpenses);
    const grandTotal = plannedTotal + recurringTotal + unplannedTotal;

    const byGoalMap = new Map();
    for (const expense of plannedExpenses) {
      const key = expense.goalId;
      const existing = byGoalMap.get(key) || { goalId: key, name: expense.goal.name, total: 0n };
      existing.total += expense.amount;
      byGoalMap.set(key, existing);
    }
    for (const instance of goalLinkedInstances) {
      const key = instance.goalId;
      const existing = byGoalMap.get(key) || { goalId: key, name: instance.goal.name, total: 0n };
      existing.total += instance.amount;
      byGoalMap.set(key, existing);
    }

    const byCategory = [
      ...Array.from(byGoalMap.values()).map((g) => ({ category: g.name, goalId: g.goalId, total: g.total })),
    ];
    if (recurringTotal > 0n) byCategory.push({ category: "Kundalik xarajat", goalId: null, total: recurringTotal });
    if (unplannedTotal > 0n) byCategory.push({ category: "Kutilmagan xarajat", goalId: null, total: unplannedTotal });

    const allRows = [...plannedExpenses, ...recurringInstances, ...unplannedExpenses];
    const trend = this.#buildTrend(query.period, from, to, allRows);
    const topExpense = this.#findTopExpense(plannedExpenses, recurringInstances, unplannedExpenses);

    return {
      period: { type: query.period, from, to },
      totals: { plannedTotal, recurringTotal, unplannedTotal, grandTotal },
      byGoal: Array.from(byGoalMap.values()),
      byCategory,
      trend,
      topExpense,
    };
  }
}

export const statisticsService = new StatisticsService();
