import { NextResponse } from "next/server";
import axios from "axios";
import { prisma } from "../../../../../prisma/Client";

export async function POST(req: Request) {
  try {
    const { robloxId } = await req.json();
    if (!robloxId) {
      return NextResponse.json({ error: "Missing robloxId" }, { status: 400 });
    }

    // Get Roblox group roles
    const { data } = await axios.get(
      `https://groups.roblox.com/v2/users/${robloxId}/groups/roles`
    );

    const userGroups = data?.data ?? [];
    const groupIds = userGroups.map((g: any) => g.group.id.toString());

    // Find workspaces matching groups
    const workspaces = await prisma.workspace.findMany({
      where: { groupId: { in: groupIds } },
    });

    const updated: string[] = [];

    for (const workspace of workspaces) {
      const match = userGroups.find(
        (g: any) => g.group.id.toString() === workspace.groupId
      );
      if (!match) continue;

      const userRank = match.role.rank;
      const rankName = match.role.name;
      const allowed = workspace.allowedRanks.includes(userRank);

      // Find existing membership
      const existing = await prisma.workspaceMember.findFirst({
        where: { workspaceId: workspace.id, robloxId: robloxId.toString() },
      });

      if (allowed) {
        // Upsert membership
        if (existing) {
          await prisma.workspaceMember.update({
            where: { id: existing.id },
            data: { rank: userRank, rankName },
          });
        } else {
          // Find linked user if exists
          const user = await prisma.user.findUnique({
            where: { robloxId: robloxId.toString() },
          });

          await prisma.workspaceMember.create({
            data: {
              workspaceId: workspace.id,
              userId: user ? user.id : workspace.ownerId, // fallback if user not registered yet
              robloxId: robloxId.toString(),
              rank: userRank,
              rankName,
              roles: [],
            },
          });
        }
        updated.push(workspace.groupName ?? workspace.id);
      } else if (existing) {
        await prisma.workspaceMember.delete({ where: { id: existing.id } });
      }
    }

    return NextResponse.json({
      success: true,
      updatedCount: updated.length,
      updatedWorkspaces: updated,
    });
  } catch (err: any) {
    console.error("Role sync failed:", err);
    return NextResponse.json(
      { error: "Internal server error", detail: err.message },
      { status: 500 }
    );
  }
}