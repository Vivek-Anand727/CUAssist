/*
  Warnings:

  - A unique constraint covering the columns `[canteenName]` on the table `Canteen` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Canteen_canteenName_key" ON "Canteen"("canteenName");
