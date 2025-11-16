import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { prisma } from "../../../prisma/Client";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { robloxId } = req.body;
    if (!robloxId) {
      return res.status(400).json({ error: "Missing robloxId" });
    }

    // Fetch Roblox groups for user
    const groupsRes = await axios.get(
      `https://groups.roblox.com/v2/users/${robloxId}/groups/roles`
    );

    const userGroups = groupsRes.data.data || [];

    // Collect all group IDs
    const groupIds = userGroups.map((g: any) => g.group.id.toString());

    // Find workspaces which belong to those groups
    const workspaces = await prisma.workspace.findMany({
      where: { groupId: { in: groupIds } },
    });

    const updated: { workspaceId: string; groupId: string }[] = [];

    for (const workspace of workspaces) {
      const match = userGroups.find(
        (g: any) => g.group.id.toString() === workspace.groupId
      );
      if (!match) continue;

      const userRank = match.role.rank;
      const rankName = match.role.name;

      const allowedRanks = workspace.allowedRanks as number[];
      const hasAccess = allowedRanks.includes(userRank);

      // Check entry in WorkspaceMember
      const existing = await prisma.workspaceMember.findFirst({
        where: {
          workspaceId: workspace.id,
          userId: robloxId.toString(), // userId stores Roblox ID
        },
      });

      if (hasAccess) {
        if (existing) {
          // Update rank
          await prisma.workspaceMember.update({
            where: { id: existing.id },
            data: { rankId: userRank, rankName },
          });
        } else {
          // Create membership entry
          await prisma.workspaceMember.create({
            data: {
              workspaceId: workspace.id,
              userId: robloxId.toString(), // store robloxId as userId
              rankId: userRank,
              rankName,
            },
          });
        }

        updated.push({ workspaceId: workspace.id, groupId: workspace.groupId });
      } else {
        // Remove if no longer allowed
        if (existing) {
          await prisma.workspaceMember.delete({ where: { id: existing.id } });
        }
      }
    }

    return res.status(200).json({
      success: true,
      updatedCount: updated.length,
      updatedWorkspaces: updated,
    });

  } catch (err: any) {
    console.error("Role sync failed:", err);
    return res.status(500).json({
      error: "Internal Server Error",
      detail: err.message,
    });
  }
}