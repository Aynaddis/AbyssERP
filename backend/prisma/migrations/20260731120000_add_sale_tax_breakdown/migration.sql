-- AlterTable
ALTER TABLE "sales_orders" ADD COLUMN "subtotal" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "sales_orders" ADD COLUMN "taxAmount" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- Backfill existing sales: tax logic didn't exist before this migration, so every
-- existing totalAmount was actually a pre-tax subtotal — mirror it into the new
-- subtotal column and leave taxAmount at 0 for historical rows.
UPDATE "sales_orders" SET "subtotal" = "totalAmount" WHERE "subtotal" = 0;