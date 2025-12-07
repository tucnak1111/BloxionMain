/*
  Warnings:

  - The primary key for the `WorkspacePlaytime` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[robloxId,workspaceId]` on the table `WorkspacePlaytime` will be added. If there are existing duplicate values, this will fail.
  - The required column `id` was added to the `WorkspacePlaytime` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- DropIndex
DROP INDEX "WorkspacePlaytime_workspaceId_robloxId_idx";

-- AlterTable
ALTER TABLE "WorkspacePlaytime" DROP CONSTRAINT "WorkspacePlaytime_pkey",
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "WorkspacePlaytime_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "WorkspacePlaytime_robloxId_workspaceId_key" ON "WorkspacePlaytime"("robloxId", "workspaceId");
