/*
  Warnings:

  - You are about to drop the column `code` on the `agent` table. All the data in the column will be lost.
  - You are about to drop the column `trackingCode` on the `delivery` table. All the data in the column will be lost.
  - Added the required column `ref` to the `Agent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ref` to the `Delivery` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ref` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ref` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ref` to the `Promotion` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `agent` DROP COLUMN `code`,
    ADD COLUMN `ref` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `delivery` DROP COLUMN `trackingCode`,
    ADD COLUMN `ref` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `order` ADD COLUMN `ref` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `product` ADD COLUMN `ref` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `promotion` ADD COLUMN `ref` VARCHAR(191) NOT NULL;
