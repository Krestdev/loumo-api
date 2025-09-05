/*
  Warnings:

  - You are about to drop the column `description` on the `operationlog` table. All the data in the column will be lost.
  - Made the column `changes` on table `operationlog` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `refIn` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `OperationLog` DROP COLUMN `description`,
    MODIFY `changes` JSON NOT NULL;

-- AlterTable
ALTER TABLE `Order` ADD COLUMN `refIn` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `Product` MODIFY `description` VARCHAR(255) NULL;
