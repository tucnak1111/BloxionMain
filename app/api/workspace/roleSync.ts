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

    
    const groupsRes = await axios.get(
      `https://groups.roblox.com/v2/users/${robloxId}/groups/roles`
    );

    const userGroups = groupsRes.data.data || [];

    
    const groupIds = userGroups.map((g: any) => g.group.id.toString());
    const workspaces = await prisma.workspace.findMany({
      where: { groupId: { in: groupIds } },
    });

    const updatedWorkspaces: string[] = [];

    for (const workspace of workspaces) {
      const match = userGroups.find(
        (g: any) => g.group.id.toString() === workspace.groupId
      );
      if (!match) continue;

      const userRank = match.role.rank;
      const rankName = match.role.name;

      const allowedRanks = workspace.allowedRanks as number[];
      const hasAccess = allowedRanks.includes(userRank);

      
      const existing = await prisma.workspaceMember.findFirst({
        where: { workspaceId: workspace.id, robloxId: robloxId.toString() },
      });

      if (hasAccess) {
        
        if (existing) {
          await prisma.workspaceMember.update({
            where: { id: existing.id },
            data: { rankId: userRank, rankName },
          });
        } else {
          await prisma.workspaceMember.create({
            data: {
              workspaceId: workspace.id,
              userId: workspace.ownerId, // optional — depends how you handle links
              robloxId: robloxId.toString(),
              rankId: userRank,
              rankName,
            },
          });
        }
        updatedWorkspaces.push(workspace.groupName);
      } else {
        // If user no longer qualifies, remove them
        if (existing) {
          await prisma.workspaceMember.delete({ where: { id: existing.id } });
        }
      }
    }

    return res.status(200).json({
      success: true,
      updatedCount: updatedWorkspaces.length,
      updatedWorkspaces,
    });
  } catch (err: any) {
    console.error("Role sync failed:", err.message);
    return res.status(500).json({ error: "Internal Server Error", detail: err.message });
  }
}
