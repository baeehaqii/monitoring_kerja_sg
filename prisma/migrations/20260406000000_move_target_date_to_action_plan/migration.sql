-- Move targetDate from ProgramKerja to ActionPlan
ALTER TABLE "ActionPlan" ADD COLUMN "targetDate" TIMESTAMP(3);
ALTER TABLE "ProgramKerja" DROP COLUMN IF EXISTS "targetDate";
