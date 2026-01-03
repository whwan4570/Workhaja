-- AlterTable
ALTER TABLE "memberships" ADD COLUMN IF NOT EXISTS "permissions" JSONB;

