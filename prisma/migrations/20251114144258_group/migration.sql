/*
  Warnings:

  - You are about to drop the column `role_name` on the `Project` table. All the data in the column will be lost.
  - Added the required column `role_id` to the `Project` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PrjectStatus" AS ENUM ('OPEN', 'DONE', 'CLOSED');

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "role_name",
ADD COLUMN     "role_id" TEXT NOT NULL,
ADD COLUMN     "status" "PrjectStatus" NOT NULL DEFAULT 'OPEN';

-- CreateTable
CREATE TABLE "Group" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Group_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
