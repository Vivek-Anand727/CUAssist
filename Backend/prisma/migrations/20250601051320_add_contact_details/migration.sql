/*
  Warnings:

  - Added the required column `contactDetails` to the `Item` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contactDetails` to the `ItemRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Item" ADD COLUMN     "contactDetails" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ItemRequest" ADD COLUMN     "contactDetails" TEXT NOT NULL;
