/*
  Warnings:

  - You are about to drop the column `weight` on the `Category` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Category" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "imgUrl" TEXT,
    "status" BOOLEAN NOT NULL DEFAULT true
);
INSERT INTO "new_Category" ("id", "imgUrl", "name", "status") SELECT "id", "imgUrl", "name", "status" FROM "Category";
DROP TABLE "Category";
ALTER TABLE "new_Category" RENAME TO "Category";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
