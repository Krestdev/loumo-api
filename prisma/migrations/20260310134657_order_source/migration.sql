-- CreateEnum
CREATE TYPE "OrderSource" AS ENUM ('web', 'mobile');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "source" "OrderSource" NOT NULL DEFAULT 'web';
