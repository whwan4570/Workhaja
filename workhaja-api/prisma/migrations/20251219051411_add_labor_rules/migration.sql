-- AlterTable
ALTER TABLE "stores" ADD COLUMN     "break_paid" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "overtime_daily_enabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "overtime_daily_minutes" INTEGER NOT NULL DEFAULT 480,
ADD COLUMN     "overtime_weekly_enabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "overtime_weekly_minutes" INTEGER NOT NULL DEFAULT 2400,
ADD COLUMN     "week_starts_on" INTEGER NOT NULL DEFAULT 1;
