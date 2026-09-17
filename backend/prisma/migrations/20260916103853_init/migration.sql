-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('parent', 'child');

-- CreateTable
CREATE TABLE "parents" (
    "id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "parents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "children" (
    "id" TEXT NOT NULL,
    "parent_id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "phone" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "children_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "goals" (
    "id" TEXT NOT NULL,
    "child_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "planned_expenses" (
    "id" TEXT NOT NULL,
    "child_id" TEXT NOT NULL,
    "goal_id" TEXT NOT NULL,
    "amount" BIGINT NOT NULL,
    "date" DATE NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "planned_expenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recurring_rules" (
    "id" TEXT NOT NULL,
    "child_id" TEXT NOT NULL,
    "amount" BIGINT NOT NULL,
    "days_of_week" INTEGER[],
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "comment" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recurring_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recurring_expense_instances" (
    "id" TEXT NOT NULL,
    "rule_id" TEXT NOT NULL,
    "child_id" TEXT NOT NULL,
    "amount" BIGINT NOT NULL,
    "date" DATE NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recurring_expense_instances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unplanned_expenses" (
    "id" TEXT NOT NULL,
    "child_id" TEXT NOT NULL,
    "amount" BIGINT NOT NULL,
    "reason" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "unplanned_expenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "user_type" "UserType" NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "parents_phone_key" ON "parents"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "children_phone_key" ON "children"("phone");

-- CreateIndex
CREATE INDEX "children_parent_id_idx" ON "children"("parent_id");

-- CreateIndex
CREATE INDEX "goals_child_id_idx" ON "goals"("child_id");

-- CreateIndex
CREATE INDEX "planned_expenses_child_id_idx" ON "planned_expenses"("child_id");

-- CreateIndex
CREATE INDEX "planned_expenses_goal_id_idx" ON "planned_expenses"("goal_id");

-- CreateIndex
CREATE INDEX "planned_expenses_date_idx" ON "planned_expenses"("date");

-- CreateIndex
CREATE INDEX "recurring_rules_child_id_idx" ON "recurring_rules"("child_id");

-- CreateIndex
CREATE INDEX "recurring_expense_instances_child_id_idx" ON "recurring_expense_instances"("child_id");

-- CreateIndex
CREATE INDEX "recurring_expense_instances_date_idx" ON "recurring_expense_instances"("date");

-- CreateIndex
CREATE UNIQUE INDEX "recurring_expense_instances_rule_id_date_key" ON "recurring_expense_instances"("rule_id", "date");

-- CreateIndex
CREATE INDEX "unplanned_expenses_child_id_idx" ON "unplanned_expenses"("child_id");

-- CreateIndex
CREATE INDEX "unplanned_expenses_date_idx" ON "unplanned_expenses"("date");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_hash_key" ON "refresh_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "refresh_tokens_user_id_idx" ON "refresh_tokens"("user_id");

-- AddForeignKey
ALTER TABLE "children" ADD CONSTRAINT "children_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "parents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goals" ADD CONSTRAINT "goals_child_id_fkey" FOREIGN KEY ("child_id") REFERENCES "children"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "planned_expenses" ADD CONSTRAINT "planned_expenses_child_id_fkey" FOREIGN KEY ("child_id") REFERENCES "children"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "planned_expenses" ADD CONSTRAINT "planned_expenses_goal_id_fkey" FOREIGN KEY ("goal_id") REFERENCES "goals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurring_rules" ADD CONSTRAINT "recurring_rules_child_id_fkey" FOREIGN KEY ("child_id") REFERENCES "children"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurring_expense_instances" ADD CONSTRAINT "recurring_expense_instances_rule_id_fkey" FOREIGN KEY ("rule_id") REFERENCES "recurring_rules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurring_expense_instances" ADD CONSTRAINT "recurring_expense_instances_child_id_fkey" FOREIGN KEY ("child_id") REFERENCES "children"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unplanned_expenses" ADD CONSTRAINT "unplanned_expenses_child_id_fkey" FOREIGN KEY ("child_id") REFERENCES "children"("id") ON DELETE CASCADE ON UPDATE CASCADE;
