import { prisma } from "../../lib/prisma.js";
import { ApiError } from "../../utils/response.js";
import { accessControlService } from "../../lib/access.js";

const USAGE_COUNT_SELECT = { plannedExpenses: true, recurringRules: true, recurringInstances: true };

export class GoalsService {
  #serialize(goal) {
    const counts = goal._count;
    return {
      id: goal.id,
      childId: goal.childId,
      name: goal.name,
      // Maqsad ishlatilgan yozuvlar soni — 0 bo'lsa uni o'chirish mumkin.
      usageCount: counts ? counts.plannedExpenses + counts.recurringRules + counts.recurringInstances : undefined,
      createdAt: goal.createdAt,
      updatedAt: goal.updatedAt,
    };
  }

  async #findGoalOrThrow(goalId) {
    const goal = await prisma.goal.findUnique({ where: { id: goalId } });
    if (!goal) throw new ApiError(404, "Maqsad topilmadi");
    return goal;
  }

  // Bir bolada "Kurs" va "kurs" kabi takroriy maqsadlar statistikani
  // ikkiga bo'lib yubormasligi uchun nom katta-kichik harfsiz tekshiriladi.
  async #assertNameAvailable(childId, name, exceptGoalId) {
    const duplicate = await prisma.goal.findFirst({
      where: {
        childId,
        name: { equals: name, mode: "insensitive" },
        ...(exceptGoalId ? { id: { not: exceptGoalId } } : {}),
      },
    });
    if (duplicate) {
      throw new ApiError(409, `"${duplicate.name}" nomli maqsad allaqachon mavjud`);
    }
  }

  async createGoal(parentId, childId, data) {
    await accessControlService.assertParentOwnsChild(parentId, childId);
    await this.#assertNameAvailable(childId, data.name);
    const goal = await prisma.goal.create({ data: { childId, name: data.name } });
    return this.#serialize(goal);
  }

  async listGoals(user, childId) {
    await accessControlService.assertChildAccess(user, childId);
    const goals = await prisma.goal.findMany({
      where: { childId },
      orderBy: { createdAt: "asc" },
      include: { _count: { select: USAGE_COUNT_SELECT } },
    });
    return goals.map((goal) => this.#serialize(goal));
  }

  async updateGoal(parentId, goalId, data) {
    const goal = await this.#findGoalOrThrow(goalId);
    await accessControlService.assertParentOwnsChild(parentId, goal.childId);
    await this.#assertNameAvailable(goal.childId, data.name, goalId);
    const updated = await prisma.goal.update({ where: { id: goalId }, data: { name: data.name } });
    return this.#serialize(updated);
  }

  async deleteGoal(parentId, goalId) {
    const goal = await this.#findGoalOrThrow(goalId);
    await accessControlService.assertParentOwnsChild(parentId, goal.childId);

    const [plannedCount, ruleCount, instanceCount] = await Promise.all([
      prisma.plannedExpense.count({ where: { goalId } }),
      prisma.recurringRule.count({ where: { goalId } }),
      prisma.recurringExpenseInstance.count({ where: { goalId } }),
    ]);
    if (plannedCount + ruleCount + instanceCount > 0) {
      const parts = [];
      if (plannedCount + instanceCount > 0) parts.push(`${plannedCount + instanceCount} ta xarajat`);
      if (ruleCount > 0) parts.push(`${ruleCount} ta avtomatik qoida`);
      throw new ApiError(
        409,
        `"${goal.name}" maqsadiga ${parts.join(" va ")} bog'langan. Tarix saqlanib qolishi uchun bunday maqsadni o'chirib bo'lmaydi — nomini o'zgartirishingiz mumkin`,
      );
    }

    await prisma.goal.delete({ where: { id: goalId } });
    return { message: "Maqsad o'chirildi" };
  }
}

export const goalsService = new GoalsService();
