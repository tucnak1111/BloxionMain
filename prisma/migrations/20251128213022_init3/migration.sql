-- AlterTable
ALTER TABLE "Workspace" ADD COLUMN     "trackedRoleIds" INTEGER[] DEFAULT ARRAY[]::INTEGER[];
