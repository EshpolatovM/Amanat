import { prisma } from "../../lib/prisma.js";
import { startOfMonth, endOfMonth } from "../../utils/date.js";
import { recurringRulesService } from "../recurringRules/recurringRules.service.js";
import { accessControlService } from "../../lib/access.js";

export class DashboardService {
  #sumAmount(rows) {
    return rows.reduce((acc, row) => acc + row.amount, 0n);
  }

  async getDashboard(user, query) {
    const childIds = await accessControlService.resolveChildScope(user, query.childId);
    const from = startOfMonth(new Date());
    const to = endOfMonth(new Date());

    await recurringRulesService.generateDueInstancesForChildren(childIds, new Date());

    const [children, plannedExpenses, recurringInstances, unplannedExpenses] = await Promise.all([
      prisma.child.findMany({ where: { id: { in: childIds } } }),
      prisma.plannedExpense.findMany({ where: { childId: { in: childIds }, date: { gte: from, lte: to } } }),
      prisma.recurringExpenseInstance.findMany({ where: { childId: { in: childIds }, date: { gte: from, lte: to } } }),
      prisma.unplannedExpense.findMany({ where: { childId: { in: childIds }, date: { gte: from, lte: to } } }),
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

    const byChild = children.map((child) => {
      const childPlanned =
        this.#sumAmount(plannedExpenses.filter((e) => e.childId === child.id)) +
        this.#sumAmount(goalLinkedInstances.filter((e) => e.childId === child.id));
      const childRecurring = this.#sumAmount(pureRecurringInstances.filter((e) => e.childId === child.id));
      const childUnplanned = this.#sumAmount(unplannedExpenses.filter((e) => e.childId === child.id));
      return {
        childId: child.id,
        firstName: child.firstName,
        lastName: child.lastName,
        plannedTotal: childPlanned,
        recurringTotal: childRecurring,
        unplannedTotal: childUnplanned,
        total: childPlanned + childRecurring + childUnplanned,
      };
    });

    const recent = [
      ...plannedExpenses.map((e) => ({ type: "planned", id: e.id, childId: e.childId, amount: e.amount, date: e.date })),
      ...goalLinkedInstances.map((e) => ({ type: "planned", id: e.id, childId: e.childId, amount: e.amount, date: e.date })),
      ...pureRecurringInstances.map((e) => ({ type: "recurring", id: e.id, childId: e.childId, amount: e.amount, date: e.date })),
      ...unplannedExpenses.map((e) => ({ type: "unplanned", id: e.id, childId: e.childId, amount: e.amount, date: e.date })),
    ]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10);

    return {
      period: { from, to },
      totals: { plannedTotal, recurringTotal, unplannedTotal, grandTotal },
      byChild,
      recent,
    };
  }
}

export const dashboardService = new DashboardService();
