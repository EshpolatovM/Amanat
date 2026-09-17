import { prisma } from "../../lib/prisma.js";
import { ApiError } from "../../utils/response.js";
import { accessControlService } from "../../lib/access.js";

export class UnplannedExpensesService {
  #serialize(expense) {
    return {
      id: expense.id,
      childId: expense.childId,
      amount: expense.amount,
      reason: expense.reason,
      date: expense.date,
      createdAt: expense.createdAt,
      updatedAt: expense.updatedAt,
    };
  }

  async #findExpenseOrThrow(id) {
    const expense = await prisma.unplannedExpense.findUnique({ where: { id } });
    if (!expense) throw new ApiError(404, "Xarajat topilmadi");
    return expense;
  }

  async createUnplannedExpense(parentId, childId, data) {
    await accessControlService.assertParentOwnsChild(parentId, childId);
    const expense = await prisma.unplannedExpense.create({
      data: { childId, amount: data.amount, reason: data.reason, date: data.date },
    });
    return this.#serialize(expense);
  }

  async listUnplannedExpenses(user, childId, filters) {
    await accessControlService.assertChildAccess(user, childId);

    const where = { childId };
    if (filters.from || filters.to) {
      where.date = {};
      if (filters.from) where.date.gte = filters.from;
      if (filters.to) where.date.lte = filters.to;
    }

    const expenses = await prisma.unplannedExpense.findMany({ where, orderBy: { date: "desc" } });
    return expenses.map((expense) => this.#serialize(expense));
  }

  async updateUnplannedExpense(parentId, id, data) {
    const expense = await this.#findExpenseOrThrow(id);
    await accessControlService.assertParentOwnsChild(parentId, expense.childId);
    const updated = await prisma.unplannedExpense.update({ where: { id }, data });
    return this.#serialize(updated);
  }

  async deleteUnplannedExpense(parentId, id) {
    const expense = await this.#findExpenseOrThrow(id);
    await accessControlService.assertParentOwnsChild(parentId, expense.childId);
    await prisma.unplannedExpense.delete({ where: { id } });
    return { message: "Xarajat o'chirildi" };
  }
}

export const unplannedExpensesService = new UnplannedExpensesService();
