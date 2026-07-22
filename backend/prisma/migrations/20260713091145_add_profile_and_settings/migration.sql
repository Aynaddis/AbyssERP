-- CreateTable
CREATE TABLE "business_settings" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "businessName" TEXT NOT NULL DEFAULT 'AbyssERP',
    "businessLogoUrl" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'ETB',
    "taxRate" DOUBLE PRECISION,
    "notifyLowStock" BOOLEAN NOT NULL DEFAULT true,
    "notifyNewSale" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "business_settings_pkey" PRIMARY KEY ("id")
);
