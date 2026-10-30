import { prisma } from "../../lib/prisma.js";
import { ApiError } from "../../utils/response.js";
import { accessControlService } from "../../lib/access.js";
import { addUtcDays, todayInAppTz } from "../../utils/date.js";

function laterOf(a, b) {
  if (!a) return b;
  if (!b) return a;
  return a > b ? a : b;
}

function earlierOf(a, b) {
  if (!a) return b;
  if (!b) return a;
  return a < b ? a : b;
}

export class RecurringRulesService {
  #serializeRule(rule, today = todayInAppTz()) {
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
      nextDate: this.#nextOccurrence(rule, today),
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
    const today = todayInAppTz();
    return rules.map((rule) => this.#serializeRule(rule, today));
  }

  // Qoida tahrirlanganda o'zgarish faqat KELAJAKKA ta'sir qiladi: allaqachon
  // yaratilgan yozuvlar (tarix) qayta yozilmaydi, yangi summa/jadval kursordan
  // (`generatedUntil`) keyingi kunlarga qo'llanadi. Istisno — sana oralig'ini
  // aniqlashtirish: oraliqdan chiqib qolgan yozuvlar o'chiriladi, boshlanish
  // sanasi ertaroqqa surilsa esa qo'shilgan davr to'ldiriladi.
  async updateRule(parentId, id, data) {
    const existing = await this.#findRuleOrThrow(id);
    await accessControlService.assertParentOwnsChild(parentId, existing.childId);

    if (data.goalId) {
      await this.#assertGoalBelongsToChild(data.goalId, existing.childId);
    }

    const next = { ...existing };
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) next[key] = value;
    }

    // Takrorlanish turi o'zgarsa, qoida ichki jihatdan izchil qolishi shart —
    // aks holda "har oy" qoidasi `dayOfMonth`siz qolib, noto'g'ri sanalarda yozuv yaratardi.
    if (next.frequency === "weekly") {
      if (!next.daysOfWeek?.length) throw new ApiError(400, "Kamida bitta kun tanlanishi kerak");
      next.dayOfMonth = null;
    } else {
      if (!next.dayOfMonth) throw new ApiError(400, "Oyning kuni tanlanishi kerak");
      next.daysOfWeek = [];
    }
    if (next.endDate && next.endDate < next.startDate) {
      throw new ApiError(400, "Tugash sanasi boshlanish sanasidan oldin bo'lishi mumkin emas");
    }

    const today = todayInAppTz();
    const yesterday = addUtcDays(today, -1);
    let cursor = existing.generatedUntil;

    // Pauzadan qaytarilganda yoki tugagan qoida uzaytirilganda oradagi
    // (to'xtab turgan) kunlar uchun yozuv yaratilmaydi — generatsiya bugundan davom etadi.
    const resumed = !existing.active && next.active;
    const reopened =
      existing.endDate !== null && existing.endDate < today && (next.endDate === null || next.endDate >= today);
    if ((resumed || reopened) && (!cursor || cursor < yesterday)) {
      cursor = yesterday;
    }
    if (next.endDate && cursor && cursor > next.endDate) {
      cursor = next.endDate;
    }

    const startMovedEarlier = next.startDate < existing.startDate;

    const rule = await prisma.$transaction(async (tx) => {
      const updated = await tx.recurringRule.update({
        where: { id },
        data: {
          goalId: next.goalId,
          amount: next.amount,
          frequency: next.frequency,
          daysOfWeek: next.daysOfWeek,
          dayOfMonth: next.dayOfMonth,
          startDate: next.startDate,
          endDate: next.endDate,
          comment: next.comment,
          active: next.active,
          generatedUntil: cursor,
        },
        include: { goal: true },
      });

      const outsideRange = [{ date: { lt: updated.startDate } }];
      if (updated.endDate) outsideRange.push({ date: { gt: updated.endDate } });
      await tx.recurringExpenseInstance.deleteMany({ where: { ruleId: id, OR: outsideRange } });

      if (startMovedEarlier && existing.generatedUntil) {
        const backfillEnd = earlierOf(earlierOf(addUtcDays(existing.startDate, -1), updated.endDate), today);
        await this.#materialize(tx, updated, updated.startDate, backfillEnd);
      }

      if (updated.active) {
        await this.generateInstancesForRule(updated, today, tx);
      }
      return updated;
    });

    return this.#serializeRule(rule, today);
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

  // [from, to] oralig'ida qoida jadvaliga mos keladigan barcha sanalar.
  // `frequency: weekly` — daysOfWeek'dagi hafta kunlari (masalan "kundalik
  // xarajat"); `frequency: monthly` — har oyning dayOfMonth-sanasi
  // (masalan "Kurs puli — har oyning 5-sanasida").
  #occurrences(rule, from, to) {
    const dates = [];
    if (!from || !to || from > to) return dates;

    if (rule.frequency === "monthly") {
      let cursor = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), 1));
      while (cursor <= to) {
        const occurrence = this.#resolveMonthlyDate(cursor.getUTCFullYear(), cursor.getUTCMonth(), rule.dayOfMonth);
        if (occurrence >= from && occurrence <= to) dates.push(occurrence);
        cursor = new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth() + 1, 1));
      }
      return dates;
    }

    const days = new Set(rule.daysOfWeek);
    for (let cursor = new Date(from); cursor <= to; cursor = addUtcDays(cursor, 1)) {
      if (days.has(cursor.getUTCDay())) dates.push(new Date(cursor));
    }
    return dates;
  }

  // Idempotent: (ruleId, date) unique indeksi tufayli mavjud yozuvlar qayta yaratilmaydi.
  async #materialize(db, rule, from, to) {
    const dates = this.#occurrences(rule, from, to);
    if (dates.length === 0) return;
    await db.recurringExpenseInstance.createMany({
      data: dates.map((date) => ({
        ruleId: rule.id,
        childId: rule.childId,
        goalId: rule.goalId,
        amount: rule.amount,
        date,
      })),
      skipDuplicates: true,
    });
  }

  // Keyingi avtomatik yozuv sanasi (qoidalar ro'yxatida "Keyingisi: ..." uchun).
  #nextOccurrence(rule, today) {
    if (!rule.active) return null;
    const from = laterOf(rule.startDate, laterOf(today, rule.generatedUntil && addUtcDays(rule.generatedUntil, 1)));
    const to = earlierOf(rule.endDate, addUtcDays(from, 62));
    return this.#occurrences(rule, from, to)[0] ?? null;
  }

  // Kursordan (`generatedUntil`) keyingi kundan bugungacha (yoki endDate'gacha)
  // bo'lgan yozuvlarni yaratadi va kursorni suradi.
  async generateInstancesForRule(rule, today = todayInAppTz(), db = prisma) {
    const from = laterOf(rule.startDate, rule.generatedUntil && addUtcDays(rule.generatedUntil, 1));
    const to = earlierOf(rule.endDate, today);
    if (from > to) return;

    await this.#materialize(db, rule, from, to);
    await db.recurringRule.updateMany({ where: { id: rule.id }, data: { generatedUntil: to } });
    rule.generatedUntil = to;
  }

  #dueRulesWhere(today) {
    return {
      active: true,
      startDate: { lte: today },
      OR: [{ generatedUntil: null }, { generatedUntil: { lt: today } }],
    };
  }

  async generateAllDueInstances(today = todayInAppTz()) {
    const rules = await prisma.recurringRule.findMany({ where: this.#dueRulesWhere(today) });
    let failed = 0;
    for (const rule of rules) {
      try {
        await this.generateInstancesForRule(rule, today);
      } catch (err) {
        failed += 1;
        console.error(`Qoida ${rule.id} uchun generatsiya xatoligi:`, err);
      }
    }
    return { processed: rules.length, failed };
  }

  // Statistika/dashboard so'ralganda shu bolalarga tegishli faol qoidalar
  // bo'yicha hali yaratilmagan yozuvlarni tayyorlab qo'yadi (cron ishlamay
  // qolgan yoki server yangi ishga tushgan holatlar uchun himoya). Xatolik
  // bo'lsa ham sahifa mavjud ma'lumot bilan ochilaveradi.
  async generateDueInstancesForChildren(childIds, today = todayInAppTz()) {
    if (childIds.length === 0) return;
    try {
      const rules = await prisma.recurringRule.findMany({
        where: { ...this.#dueRulesWhere(today), childId: { in: childIds } },
      });
      for (const rule of rules) {
        await this.generateInstancesForRule(rule, today);
      }
    } catch (err) {
      console.error("Kundalik xarajat generatsiyasi xatoligi:", err);
    }
  }
}

export const recurringRulesService = new RecurringRulesService();
