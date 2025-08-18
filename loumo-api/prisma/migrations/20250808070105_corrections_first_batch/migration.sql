/*
  Warnings:

  - You are about to drop the column `zoneId` on the `agent` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `agent` DROP FOREIGN KEY `Agent_zoneId_fkey`;

-- DropIndex
DROP INDEX `Agent_zoneId_fkey` ON `agent`;

-- AlterTable
ALTER TABLE `agent` DROP COLUMN `zoneId`;

-- AlterTable
ALTER TABLE `product` MODIFY `description` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `zone` MODIFY `description` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `_AgentToZone` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_AgentToZone_AB_unique`(`A`, `B`),
    INDEX `_AgentToZone_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_AgentToZone` ADD CONSTRAINT `_AgentToZone_A_fkey` FOREIGN KEY (`A`) REFERENCES `Agent`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_AgentToZone` ADD CONSTRAINT `_AgentToZone_B_fkey` FOREIGN KEY (`B`) REFERENCES `Zone`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
