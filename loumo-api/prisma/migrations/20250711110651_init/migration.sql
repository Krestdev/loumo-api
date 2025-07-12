-- DropForeignKey
ALTER TABLE `faq` DROP FOREIGN KEY `Faq_topicId_fkey`;

-- DropIndex
DROP INDEX `Faq_topicId_fkey` ON `faq`;

-- AddForeignKey
ALTER TABLE `Faq` ADD CONSTRAINT `Faq_topicId_fkey` FOREIGN KEY (`topicId`) REFERENCES `Topic`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
