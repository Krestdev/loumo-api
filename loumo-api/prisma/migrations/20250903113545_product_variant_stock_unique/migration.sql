/*
  Warnings:

  - A unique constraint covering the columns `[shopId,productVariantId]` on the table `Stock` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Stock_shopId_productVariantId_key` ON `Stock`(`shopId`, `productVariantId`);
