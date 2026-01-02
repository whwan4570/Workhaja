-- AlterTable
ALTER TABLE "stores" ADD COLUMN "location" TEXT,
ADD COLUMN "special_code" TEXT NOT NULL DEFAULT '';

-- CreateIndex
CREATE UNIQUE INDEX "stores_special_code_key" ON "stores"("special_code");

-- Update existing stores with a default special code based on their ID
UPDATE "stores" SET "special_code" = 'STORE-' || SUBSTRING("id", 1, 8) WHERE "special_code" = '';

