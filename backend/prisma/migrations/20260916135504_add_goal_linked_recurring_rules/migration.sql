-- CreateEnum
CREATE TYPE "RecurringFrequency" AS ENUM ('weekly', 'monthly');

-- AlterTable
ALTER TABLE "recurring_expense_instances" ADD COLUMN     "goal_id" TEXT;

-- AlterTable
ALTER TABLE "recurring_rules" ADD COLUMN     "day_of_month" INTEGER,
ADD COLUMN     "frequency" "RecurringFrequency" NOT NULL DEFAULT 'weekly',
ADD COLUMN     "goal_id" TEXT,
ALTER COLUMN "days_of_week" SET DEFAULT ARRAY[]::INTEGER[];

-- CreateIndex
CREATE INDEX "recurring_expense_instances_goal_id_idx" ON "recurring_expense_instances"("goal_id");

-- CreateIndex
CREATE INDEX "recurring_rules_goal_id_idx" ON "recurring_rules"("goal_id");

-- AddForeignKey
ALTER TABLE "recurring_rules" ADD CONSTRAINT "recurring_rules_goal_id_fkey" FOREIGN KEY ("goal_id") REFERENCES "goals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurring_expense_instances" ADD CONSTRAINT "recurring_expense_instances_goal_id_fkey" FOREIGN KEY ("goal_id") REFERENCES "goals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
