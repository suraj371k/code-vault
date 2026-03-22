/*
  Warnings:

  - The `summary` column on the `Snippet` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Snippet" DROP COLUMN "summary",
ADD COLUMN     "summary" TEXT[];
