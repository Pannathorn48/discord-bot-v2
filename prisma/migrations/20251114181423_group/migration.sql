/*
  Warnings:

  - You are about to drop the column `guild_id` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `role_id` on the `Project` table. All the data in the column will be lost.
  - Added the required column `roleId` to the `Group` table without a default value. This is not possible if the table is not empty.
  - Added the required column `guildId` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `roleId` to the `Project` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Group" ADD COLUMN     "description" TEXT,
ADD COLUMN     "roleId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "guild_id",
DROP COLUMN "role_id",
ADD COLUMN     "guildId" TEXT NOT NULL,
ADD COLUMN     "roleId" TEXT NOT NULL;
