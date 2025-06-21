-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Payment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "payoutId" TEXT NOT NULL DEFAULT 'mn',
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "ref" TEXT NOT NULL,
    "tel" TEXT NOT NULL,
    "total" INTEGER NOT NULL,
    "orderId" INTEGER NOT NULL,
    CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Payment" ("id", "method", "name", "orderId", "ref", "status", "tel", "total") SELECT "id", "method", "name", "orderId", "ref", "status", "tel", "total" FROM "Payment";
DROP TABLE "Payment";
ALTER TABLE "new_Payment" RENAME TO "Payment";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
