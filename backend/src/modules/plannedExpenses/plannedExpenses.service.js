import { prisma } from "../../lib/prisma.js";
import { ApiError } from "../../utils/response.js";
import { accessControlService } from "../../lib/access.js";

export class PlannedExpensesService {
  #serialize(expense) {
    return {
      id: expense.id,
      childId: expense.childId,
      goalId: expense.goalId,
      goal: expense.goal ? { id: expense.goal.id, name: expense.goal.name } : undefined,
      amount: expense.amount,
      date: expense.date,
      comment: expense.comment,
      createdAt: expense.createdAt,
      updatedAt: expense.updatedAt,
    };
  }

  async #assertGoalBelongsToChild(goalId, childId) {
    const goal = await prisma.goal.findUnique({ where: { id: goalId } });
    if (!goal || goal.childId !== childId) {
      throw new ApiError(400, "Maqsad shu bolaga tegishli emas");
    }
  }

  async #findExpenseOrThrow(id) {
    const expense = await prisma.plannedExpense.findUnique({ where: { id } });
    if (!expense) throw new ApiError(404, "Xarajat topilmadi");
    return expense;
  }

  async createPlannedExpense(parentId, childId, data) {
    await accessControlService.assertParentOwnsChild(parentId, childId);
    await this.#assertGoalBelongsToChild(data.goalId, childId);

    const expense = await prisma.plannedExpense.create({
      data: { childId, goalId: data.goalId, amount: data.amount, date: data.date, comment: data.comment },
      include: { goal: true },
    });
    return this.#serialize(expense);
  }

  async listPlannedExpenses(user, childId, filters) {
    await accessControlService.assertChildAccess(user, childId);

    const where = { childId };
    if (filters.goalId) where.goalId = filters.goalId;
    if (filters.from || filters.to) {
      where.date = {};
      if (filters.from) where.date.gte = filters.from;
      if (filters.to) where.date.lte = filters.to;
    }

    const expenses = await prisma.plannedExpense.findMany({
      where,
      include: { goal: true },
      orderBy: { date: "desc" },
    });
    return expenses.map((expense) => this.#serialize(expense));
  }

  async updatePlannedExpense(parentId, id, data) {
    const expense = await this.#findExpenseOrThrow(id);
    await accessControlService.assertParentOwnsChild(parentId, expense.childId);

    if (data.goalId) {
      await this.#assertGoalBelongsToChild(data.goalId, expense.childId);
    }

    const updated = await prisma.plannedExpense.update({
      where: { id },
      data,
      include: { goal: true },
    });
    return this.#serialize(updated);
  }

  async deletePlannedExpense(parentId, id) {
    const expense = await this.#findExpenseOrThrow(id);
    await accessControlService.assertParentOwnsChild(parentId, expense.childId);
    await prisma.plannedExpense.delete({ where: { id } });
    return { message: "Xarajat o'chirildi" };
  }
}

export const plannedExpensesService = new PlannedExpensesService();
