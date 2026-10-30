import { prisma } from "./prisma.js";

export const DAILY_EXPENSE_LABEL = "Kundalik xarajat";
export const UNPLANNED_EXPENSE_LABEL = "Kutilmagan xarajat";

function byTotalDesc(a, b) {
  if (a.total === b.total) return 0;
  return a.total < b.total ? 1 : -1;
}

// Berilgan bolalar va sana oralig'idagi uch xil manbadagi (qo'lda kiritilgan
// maqsadli, avtomatik qoida yozuvlari, kutilmagan) xarajatlarni bitta
// ko'rinishga keltiradi. Maqsadga bog'langan avtomatik yozuvlar "Maqsadli
// xarajat"ga (planned) qo'shiladi (masalan "Kurs puli — har oyning
// 5-sanasida"); maqsadsizlari esa klassik "Kundalik xarajat" (recurring) bo'lib qoladi.
export async function loadExpenseEntries(childIds, from, to) {
  if (childIds.length === 0) return [];

  const where = { childId: { in: childIds }, date: { gte: from, lte: to } };
  const goalSelect = { select: { id: true, name: true } };

  const [planned, instances, unplanned] = await Promise.all([
    prisma.plannedExpense.findMany({ where, include: { goal: goalSelect } }),
    prisma.recurringExpenseInstance.findMany({
      where,
      include: { goal: goalSelect, rule: { select: { comment: true } } },
    }),
    prisma.unplannedExpense.findMany({ where }),
  ]);

  return [
    ...planned.map((e) => ({
      type: "planned",
      source: "manual",
      id: e.id,
      childId: e.childId,
      goalId: e.goalId,
      label: e.goal.name,
      comment: e.comment,
      amount: e.amount,
      date: e.date,
      createdAt: e.createdAt,
    })),
    ...instances.map((e) => ({
      type: e.goalId ? "planned" : "recurring",
      source: "auto",
      id: e.id,
      childId: e.childId,
      goalId: e.goalId,
      label: e.goal?.name ?? DAILY_EXPENSE_LABEL,
      comment: e.rule?.comment ?? null,
      amount: e.amount,
      date: e.date,
      createdAt: e.createdAt,
    })),
    ...unplanned.map((e) => ({
      type: "unplanned",
      source: "manual",
      id: e.id,
      childId: e.childId,
      goalId: null,
      label: e.reason,
      comment: null,
      amount: e.amount,
      date: e.date,
      createdAt: e.createdAt,
    })),
  ];
}

export function sumEntries(entries) {
  return entries.reduce((acc, entry) => acc + entry.amount, 0n);
}

// Jami summalar (turlar bo'yicha) va "pul qayerga ketdi" taqsimoti:
// har bir maqsad alohida, kundalik va kutilmagan xarajatlar esa bittadan toifa.
export function summarizeEntries(entries) {
  let plannedTotal = 0n;
  let recurringTotal = 0n;
  let unplannedTotal = 0n;
  const goals = new Map();

  for (const entry of entries) {
    if (entry.type === "planned") {
      plannedTotal += entry.amount;
      const goal = goals.get(entry.goalId) ?? { goalId: entry.goalId, name: entry.label, total: 0n };
      goal.total += entry.amount;
      goals.set(entry.goalId, goal);
    } else if (entry.type === "recurring") {
      recurringTotal += entry.amount;
    } else {
      unplannedTotal += entry.amount;
    }
  }

  const byGoal = [...goals.values()].sort(byTotalDesc);
  const byCategory = byGoal.map((goal) => ({
    category: goal.name,
    type: "planned",
    goalId: goal.goalId,
    total: goal.total,
  }));
  if (recurringTotal > 0n) {
    byCategory.push({ category: DAILY_EXPENSE_LABEL, type: "recurring", goalId: null, total: recurringTotal });
  }
  if (unplannedTotal > 0n) {
    byCategory.push({ category: UNPLANNED_EXPENSE_LABEL, type: "unplanned", goalId: null, total: unplannedTotal });
  }
  byCategory.sort(byTotalDesc);

  return {
    totals: {
      plannedTotal,
      recurringTotal,
      unplannedTotal,
      grandTotal: plannedTotal + recurringTotal + unplannedTotal,
    },
    byGoal,
    byCategory,
  };
}

export function toPublicEntry(entry) {
  return {
    type: entry.type,
    source: entry.source,
    id: entry.id,
    childId: entry.childId,
    label: entry.label,
    comment: entry.comment,
    amount: entry.amount,
    date: entry.date,
  };
}
