-- AlterTable: Add columns as nullable first
ALTER TABLE "stores" ADD COLUMN IF NOT EXISTS "location" TEXT;
ALTER TABLE "stores" ADD COLUMN IF NOT EXISTS "special_code" TEXT;

-- Update existing stores with a unique special code based on their ID
UPDATE "stores" SET "special_code" = 'STORE-' || SUBSTRING("id", 1, 8) WHERE "special_code" IS NULL;

-- Make special_code NOT NULL
ALTER TABLE "stores" ALTER COLUMN "special_code" SET NOT NULL;

-- CreateIndex: Add unique constraint
CREATE UNIQUE INDEX IF NOT EXISTS "stores_special_code_key" ON "stores"("special_code");

