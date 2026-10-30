import { accessControlService } from "../../lib/access.js";
import {
  addUtcDays,
  endOfUtcDay,
  periodRange,
  startOfMonth,
  todayInAppTz,
  toDateOnlyString,
} from "../../utils/date.js";
import { recurringRulesService } from "../recurringRules/recurringRules.service.js";
import { loadExpenseEntries, summarizeEntries, sumEntries } from "../../lib/expenseReport.js";

// Bundan uzun oraliqlarda trend kunma-kun emas, oyma-oy guruhlanadi.
const DAILY_TREND_MAX_DAYS = 62;
const DAY_MS = 24 * 60 * 60 * 1000;

export class StatisticsService {
  // `from`/`to` berilmasa — joriy davr (hafta/oy/yil). Faqat bittasi berilsa,
  // ikkinchisi shu sana tushgan davrdan olinadi: `?period=month&from=2026-08-01`
  // — avgust oyi. Shu orqali frontend oldingi davrlarga o'ta oladi.
  #resolveRange(query, today) {
    if (query.from && query.to) return { from: query.from, to: endOfUtcDay(query.to) };
    if (query.from) return { from: query.from, to: periodRange(query.period, query.from).to };
    if (query.to) return { from: periodRange(query.period, query.to).from, to: endOfUtcDay(query.to) };
    return periodRange(query.period, today);
  }

  #granularity(period, from, to) {
    if (period === "year") return "month";
    return (to - from) / DAY_MS > DAILY_TREND_MAX_DAYS ? "month" : "day";
  }

  #buildTrend(granularity, from, to, entries) {
    const bucketKey = (date) => (granularity === "month" ? toDateOnlyString(date).slice(0, 7) : toDateOnlyString(date));
    const buckets = new Map();

    if (granularity === "month") {
      for (
        let cursor = startOfMonth(from);
        cursor <= to;
        cursor = new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth() + 1, 1))
      ) {
        buckets.set(bucketKey(cursor), { planned: 0n, recurring: 0n, unplanned: 0n });
      }
    } else {
      for (let cursor = new Date(from); cursor <= to; cursor = addUtcDays(cursor, 1)) {
        buckets.set(bucketKey(cursor), { planned: 0n, recurring: 0n, unplanned: 0n });
      }
    }

    for (const entry of entries) {
      const bucket = buckets.get(bucketKey(entry.date));
      if (bucket) bucket[entry.type] += entry.amount;
    }

    return [...buckets.entries()].map(([bucket, sums]) => ({
      bucket,
      total: sums.planned + sums.recurring + sums.unplanned,
      ...sums,
    }));
  }

  // Davr ichidagi eng katta bitta xarajat yozuvi (turi va nomi bilan) —
  // Statistika sahifasidagi "Eng katta xarajat" ko'rsatkichi uchun.
  #findTopExpense(entries) {
    const top = entries.reduce((best, current) => (!best || current.amount > best.amount ? current : best), null);
    return top && { type: top.type, label: top.label, amount: top.amount, date: top.date };
  }

  async getStatistics(user, query) {
    const childIds = await accessControlService.resolveChildScope(user, query.childId);
    const today = todayInAppTz();
    const { from, to } = this.#resolveRange(query, today);

    await recurringRulesService.generateDueInstancesForChildren(childIds, today);
    const entries = await loadExpenseEntries(childIds, from, to);

    const { totals, byGoal, byCategory } = summarizeEntries(entries);
    const granularity = this.#granularity(query.period, from, to);

    return {
      period: { type: query.period, from, to, granularity },
      totals,
      byGoal,
      byCategory,
      trend: this.#buildTrend(granularity, from, to, entries),
      topExpense: this.#findTopExpense(entries),
    };
  }

  // Statistika sahifasining yuqori qismi uchun: bugun / shu hafta / shu oy
  // jamlari bitta so'rovda (avval uchta alohida so'rov yuborilardi).
  async getSummary(user, query) {
    const childIds = await accessControlService.resolveChildScope(user, query.childId);
    const today = todayInAppTz();
    const week = periodRange("week", today);
    const month = periodRange("month", today);

    await recurringRulesService.generateDueInstancesForChildren(childIds, today);

    const from = week.from < month.from ? week.from : month.from;
    const to = week.to > month.to ? week.to : month.to;
    const entries = await loadExpenseEntries(childIds, from, to);
    const totalIn = (range) => sumEntries(entries.filter((e) => e.date >= range.from && e.date <= range.to));

    const todayRange = { from: today, to: endOfUtcDay(today) };
    return {
      today: { ...todayRange, total: totalIn(todayRange) },
      week: { ...week, total: totalIn(week) },
      month: { ...month, total: totalIn(month) },
    };
  }
}

export const statisticsService = new StatisticsService();
