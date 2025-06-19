/*
  Warnings:

  - You are about to drop the column `email` on the `Agent` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Agent` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `Agent` table. All the data in the column will be lost.
  - You are about to drop the column `tel` on the `Agent` table. All the data in the column will be lost.
  - Added the required column `code` to the `Agent` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Agent" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "Agent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Agent" ("id", "userId") SELECT "id", "userId" FROM "Agent";
DROP TABLE "Agent";
ALTER TABLE "new_Agent" RENAME TO "Agent";
CREATE UNIQUE INDEX "Agent_userId_key" ON "Agent"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
