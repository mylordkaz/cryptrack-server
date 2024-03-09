/*
  Warnings:

  - Made the column `quantity` on table `Transaction` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Transaction" ALTER COLUMN "amount" DROP NOT NULL,
ALTER COLUMN "quantity" SET NOT NULL;
