import { prisma } from "../../lib/prisma.js";
import { periodRange, todayInAppTz } from "../../utils/date.js";
import { recurringRulesService } from "../recurringRules/recurringRules.service.js";
import { accessControlService } from "../../lib/access.js";
import { loadExpenseEntries, summarizeEntries, toPublicEntry } from "../../lib/expenseReport.js";

const RECENT_LIMIT = 10;

export class DashboardService {
  async getDashboard(user, query) {
    const childIds = await accessControlService.resolveChildScope(user, query.childId);
    const today = todayInAppTz();
    const { from, to } = periodRange("month", today);

    await recurringRulesService.generateDueInstancesForChildren(childIds, today);

    const [children, entries] = await Promise.all([
      prisma.child.findMany({ where: { id: { in: childIds } }, orderBy: { createdAt: "asc" } }),
      loadExpenseEntries(childIds, from, to),
    ]);

    const { totals, byCategory } = summarizeEntries(entries);

    const byChild = children.map((child) => {
      const childTotals = summarizeEntries(entries.filter((e) => e.childId === child.id)).totals;
      return {
        childId: child.id,
        firstName: child.firstName,
        lastName: child.lastName,
        plannedTotal: childTotals.plannedTotal,
        recurringTotal: childTotals.recurringTotal,
        unplannedTotal: childTotals.unplannedTotal,
        total: childTotals.grandTotal,
      };
    });

    // "So'nggi yozuvlar"ni har kuni avtomatik qo'shiladigan mayda kundalik
    // yozuvlar bosib ketmasligi uchun ular chetlatiladi (ularning jami
    // taqsimotda "Kundalik xarajat" qatorida bor). Faqat shular bo'lsa — ko'rsatamiz.
    const byNewest = (a, b) => b.date - a.date || b.createdAt - a.createdAt;
    const notable = entries.filter((e) => !(e.source === "auto" && e.type === "recurring"));
    const recent = (notable.length > 0 ? notable : entries).sort(byNewest).slice(0, RECENT_LIMIT).map(toPublicEntry);

    return {
      period: { from, to },
      totals,
      byCategory,
      byChild,
      recent,
    };
  }
}

export const dashboardService = new DashboardService();
