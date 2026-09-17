import { prisma } from "../../lib/prisma.js";
import { ApiError } from "../../utils/response.js";
import { accessControlService } from "../../lib/access.js";
import { startOfUtcDay } from "../../utils/date.js";

export class RecurringRulesService {
  #serializeRule(rule) {
    return {
      id: rule.id,
      childId: rule.childId,
      goalId: rule.goalId,
      goal: rule.goal ? { id: rule.goal.id, name: rule.goal.name } : undefined,
      amount: rule.amount,
      frequency: rule.frequency,
      daysOfWeek: rule.daysOfWeek,
      dayOfMonth: rule.dayOfMonth,
      startDate: rule.startDate,
      endDate: rule.endDate,
      comment: rule.comment,
      active: rule.active,
      createdAt: rule.createdAt,
      updatedAt: rule.updatedAt,
    };
  }

  #serializeInstance(instance) {
    return {
      id: instance.id,
      ruleId: instance.ruleId,
      childId: instance.childId,
      goalId: instance.goalId,
      amount: instance.amount,
      date: instance.date,
      createdAt: instance.createdAt,
    };
  }

  async #findRuleOrThrow(id) {
    const rule = await prisma.recurringRule.findUnique({ where: { id } });
    if (!rule) throw new ApiError(404, "Qoida topilmadi");
    return rule;
  }

  async #assertGoalBelongsToChild(goalId, childId) {
    const goal = await prisma.goal.findUnique({ where: { id: goalId } });
    if (!goal || goal.childId !== childId) {
      throw new ApiError(400, "Maqsad shu bolaga tegishli emas");
    }
  }

  async createRule(parentId, childId, data) {
    await accessControlService.assertParentOwnsChild(parentId, childId);
    if (data.goalId) {
      await this.#assertGoalBelongsToChild(data.goalId, childId);
    }

    const rule = await prisma.recurringRule.create({
      data: {
        childId,
        goalId: data.goalId,
        amount: data.amount,
        frequency: data.frequency,
        daysOfWeek: data.frequency === "weekly" ? data.daysOfWeek : [],
        dayOfMonth: data.frequency === "monthly" ? data.dayOfMonth : null,
        startDate: data.startDate,
        endDate: data.endDate,
        comment: data.comment,
      },
      include: { goal: true },
    });

    await this.generateInstancesForRule(rule);
    return this.#serializeRule(rule);
  }

  async listRules(user, childId) {
    await accessControlService.assertChildAccess(user, childId);
    const rules = await prisma.recurringRule.findMany({
      where: { childId },
      include: { goal: true },
      orderBy: { createdAt: "asc" },
    });
    return rules.map((rule) => this.#serializeRule(rule));
  }

  async updateRule(parentId, id, data) {
    const existing = await this.#findRuleOrThrow(id);
    await accessControlService.assertParentOwnsChild(parentId, existing.childId);

    if (data.goalId) {
      await this.#assertGoalBelongsToChild(data.goalId, existing.childId);
    }

    const effectiveStart = data.startDate ?? existing.startDate;
    const effectiveEnd = data.endDate === undefined ? existing.endDate : data.endDate;
    if (effectiveEnd && effectiveEnd < effectiveStart) {
      throw new ApiError(400, "Tugash sanasi boshlanish sanasidan oldin bo'lishi mumkin emas");
    }

    const rule = await prisma.recurringRule.update({ where: { id }, data, include: { goal: true } });

    if (rule.active) {
      await this.generateInstancesForRule(rule);
    }

    return this.#serializeRule(rule);
  }

  async deleteRule(parentId, id) {
    const rule = await this.#findRuleOrThrow(id);
    await accessControlService.assertParentOwnsChild(parentId, rule.childId);
    await prisma.recurringRule.delete({ where: { id } });
    return { message: "Qoida o'chirildi" };
  }

  async listInstances(user, ruleId) {
    const rule = await this.#findRuleOrThrow(ruleId);
    await accessControlService.assertChildAccess(user, rule.childId);
    const instances = await prisma.recurringExpenseInstance.findMany({
      where: { ruleId },
      orderBy: { date: "desc" },
    });
    return instances.map((instance) => this.#serializeInstance(instance));
  }

  // Berilgan oy uchun `dayOfMonth`ga mos sana — agar oy shuncha kunga ega
  // bo'lmasa (masalan 31-fevral), oyning oxirgi kuniga qisqartiriladi.
  #resolveMonthlyDate(year, month, dayOfMonth) {
    const lastDayOfMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    const day = Math.min(dayOfMonth, lastDayOfMonth);
    return new Date(Date.UTC(year, month, day));
  }

  // Berilgan qoida uchun startDate'dan bugungi kun (yoki endDate, qaysi bir oldin
  // bo'lsa) gacha bo'lgan barcha mos sanalar uchun xarajat yozuvlarini generatsiya
  // qiladi. Idempotent: mavjud (ruleId, date) juftliklari qayta yozilmaydi.
  // `frequency: weekly` — daysOfWeek'da belgilangan haftaning kunlarida (masalan
  // "kundalik xarajat"); `frequency: monthly` — dayOfMonth'da belgilangan
  // sanada (masalan "Kurs puli — har oyning 5-sanasida").
  async generateInstancesForRule(rule, referenceDate = new Date()) {
    const today = startOfUtcDay(referenceDate);
    const start = startOfUtcDay(rule.startDate);
    const end = rule.endDate && startOfUtcDay(rule.endDate) < today ? startOfUtcDay(rule.endDate) : today;

    if (start > end) return;

    const records = [];

    if (rule.frequency === "monthly") {
      let cursor = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 1));
      const endCursor = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), 1));
      while (cursor <= endCursor) {
        const occurrence = this.#resolveMonthlyDate(cursor.getUTCFullYear(), cursor.getUTCMonth(), rule.dayOfMonth);
        if (occurrence >= start && occurrence <= end) {
          records.push({
            ruleId: rule.id,
            childId: rule.childId,
            goalId: rule.goalId,
            amount: rule.amount,
            date: occurrence,
          });
        }
        cursor = new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth() + 1, 1));
      }
    } else {
      const daysSet = new Set(rule.daysOfWeek);
      const cursor = new Date(start);
      while (cursor <= end) {
        if (daysSet.has(cursor.getUTCDay())) {
          records.push({
            ruleId: rule.id,
            childId: rule.childId,
            goalId: rule.goalId,
            amount: rule.amount,
            date: new Date(cursor),
          });
        }
        cursor.setUTCDate(cursor.getUTCDate() + 1);
      }
    }

    if (records.length === 0) return;

    await prisma.recurringExpenseInstance.createMany({
      data: records,
      skipDuplicates: true,
    });
  }

  async generateAllDueInstances(referenceDate = new Date()) {
    const activeRules = await prisma.recurringRule.findMany({ where: { active: true } });
    for (const rule of activeRules) {
      await this.generateInstancesForRule(rule, referenceDate);
    }
    return { processed: activeRules.length };
  }

  // Statistika/dashboard so'ralganda shu bolalarga tegishli faol qoidalar
  // bo'yicha hali yaratilmagan yozuvlarni tayyorlab qo'yadi (cron ishlamay
  // qolgan yoki server yangi ishga tushgan holatlar uchun himoya).
  async generateDueInstancesForChildren(childIds, referenceDate = new Date()) {
    if (childIds.length === 0) return;
    const activeRules = await prisma.recurringRule.findMany({
      where: { active: true, childId: { in: childIds } },
    });
    for (const rule of activeRules) {
      await this.generateInstancesForRule(rule, referenceDate);
    }
  }
}

export const recurringRulesService = new RecurringRulesService();
