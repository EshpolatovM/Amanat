import { prisma } from "../../lib/prisma.js";
import { ApiError } from "../../utils/response.js";
import { accessControlService } from "../../lib/access.js";

export class GoalsService {
  #serialize(goal) {
    return {
      id: goal.id,
      childId: goal.childId,
      name: goal.name,
      createdAt: goal.createdAt,
      updatedAt: goal.updatedAt,
    };
  }

  async #findGoalOrThrow(goalId) {
    const goal = await prisma.goal.findUnique({ where: { id: goalId } });
    if (!goal) throw new ApiError(404, "Maqsad topilmadi");
    return goal;
  }

  async createGoal(parentId, childId, data) {
    await accessControlService.assertParentOwnsChild(parentId, childId);
    const goal = await prisma.goal.create({ data: { childId, name: data.name } });
    return this.#serialize(goal);
  }

  async listGoals(user, childId) {
    await accessControlService.assertChildAccess(user, childId);
    const goals = await prisma.goal.findMany({ where: { childId }, orderBy: { createdAt: "asc" } });
    return goals.map((goal) => this.#serialize(goal));
  }

  async updateGoal(parentId, goalId, data) {
    const goal = await this.#findGoalOrThrow(goalId);
    await accessControlService.assertParentOwnsChild(parentId, goal.childId);
    const updated = await prisma.goal.update({ where: { id: goalId }, data: { name: data.name } });
    return this.#serialize(updated);
  }

  async deleteGoal(parentId, goalId) {
    const goal = await this.#findGoalOrThrow(goalId);
    await accessControlService.assertParentOwnsChild(parentId, goal.childId);
    await prisma.goal.delete({ where: { id: goalId } });
    return { message: "Maqsad o'chirildi" };
  }
}

export const goalsService = new GoalsService();
