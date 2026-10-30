-- AlterTable
ALTER TABLE "recurring_rules" ADD COLUMN     "generated_until" DATE;

-- Mavjud qoidalar uchun kursorni allaqachon yaratilgan eng oxirgi yozuv
-- sanasiga qo'yamiz — keyingi generatsiya shu kundan keyin davom etadi.
UPDATE "recurring_rules" AS r
SET "generated_until" = sub."max_date"
FROM (
  SELECT "rule_id", MAX("date") AS "max_date"
  FROM "recurring_expense_instances"
  GROUP BY "rule_id"
) AS sub
WHERE sub."rule_id" = r."id";
