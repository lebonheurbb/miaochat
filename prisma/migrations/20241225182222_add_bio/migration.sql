/*
  Warnings:

  - You are about to drop the column `amount` on the `PointsHistory` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `PointsHistory` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `PointsHistory` table. All the data in the column will be lost.
  - Added the required column `points` to the `PointsHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reason` to the `PointsHistory` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN "bio" TEXT DEFAULT '';

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PointsHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_PointsHistory" ("createdAt", "id", "userId") SELECT "createdAt", "id", "userId" FROM "PointsHistory";
DROP TABLE "PointsHistory";
ALTER TABLE "new_PointsHistory" RENAME TO "PointsHistory";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
