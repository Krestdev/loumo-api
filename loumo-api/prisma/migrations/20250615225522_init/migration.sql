/*
  Warnings:

  - You are about to drop the column `ExpireAt` on the `Promotion` table. All the data in the column will be lost.
  - Added the required column `expireAt` to the `Promotion` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Promotion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "percentage" INTEGER NOT NULL,
    "expireAt" DATETIME NOT NULL
);
INSERT INTO "new_Promotion" ("code", "id", "percentage") SELECT "code", "id", "percentage" FROM "Promotion";
DROP TABLE "Promotion";
ALTER TABLE "new_Promotion" RENAME TO "Promotion";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
