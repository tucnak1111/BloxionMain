-- DropForeignKey
ALTER TABLE "Workspace" DROP CONSTRAINT "Workspace_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "WorkspaceMember" DROP CONSTRAINT "WorkspaceMember_userId_fkey";

-- DropForeignKey
ALTER TABLE "WorkspaceMember" DROP CONSTRAINT "WorkspaceMember_workspaceId_fkey";

-- CreateTable
CREATE TABLE "GlobalNotice" (
    "id" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "type" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "authorName" TEXT,
    "authorAvatar" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GlobalNotice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkspacePlaytime" (
    "robloxId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "seconds" INTEGER NOT NULL,

    CONSTRAINT "WorkspacePlaytime_pkey" PRIMARY KEY ("robloxId")
);

-- CreateIndex
CREATE INDEX "WorkspacePlaytime_workspaceId_idx" ON "WorkspacePlaytime"("workspaceId");

-- CreateIndex
CREATE INDEX "WorkspacePlaytime_robloxId_idx" ON "WorkspacePlaytime"("robloxId");

-- CreateIndex
CREATE INDEX "WorkspacePlaytime_workspaceId_robloxId_idx" ON "WorkspacePlaytime"("workspaceId", "robloxId");

-- AddForeignKey
ALTER TABLE "Workspace" ADD CONSTRAINT "Workspace_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceMember" ADD CONSTRAINT "WorkspaceMember_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceMember" ADD CONSTRAINT "WorkspaceMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspacePlaytime" ADD CONSTRAINT "WorkspacePlaytime_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
