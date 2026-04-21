-- AlterTable
ALTER TABLE "Agent" ADD COLUMN     "isAvailable" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Delivery" ADD COLUMN     "ongoing" BOOLEAN NOT NULL DEFAULT false;
