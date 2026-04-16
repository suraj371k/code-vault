/*
  Warnings:

  - You are about to drop the column `plan` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `planExpiresAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `stripeCustomerId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `subscriptionId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `subscriptionStatus` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[stripeCustomerId]` on the table `Organization` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[subscriptionId]` on the table `Organization` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "User_stripeCustomerId_key";

-- DropIndex
DROP INDEX "User_subscriptionId_key";

-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "plan" "Plan" NOT NULL DEFAULT 'FREE',
ADD COLUMN     "planExpiresAt" TIMESTAMP(3),
ADD COLUMN     "stripeCustomerId" TEXT,
ADD COLUMN     "subscriptionId" TEXT,
ADD COLUMN     "subscriptionStatus" TEXT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "plan",
DROP COLUMN "planExpiresAt",
DROP COLUMN "stripeCustomerId",
DROP COLUMN "subscriptionId",
DROP COLUMN "subscriptionStatus";

-- CreateIndex
CREATE UNIQUE INDEX "Organization_stripeCustomerId_key" ON "Organization"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_subscriptionId_key" ON "Organization"("subscriptionId");
