import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../prisma/client";
import axios from "axios";


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { userId, workspaceId } = req.query;

    if (!userId || !workspaceId) {
      return res.status(400).json({ error: "Missing userId or workspaceId" });
    }


    const workspace = await prisma.workspace.findUnique({
      where: { id: String(workspaceId) },
    });

    if (!workspace) {
      return res.status(404).json({ error: "Workspace not found" });
    }

    const groupRolesRes = await axios.get(
      `https://groups.roblox.com/v2/users/${userId}/groups/roles`
    );
    const userGroups = groupRolesRes.data.data;


    const groupMatch = userGroups.find(
      (g: any) => g.group.id.toString() === workspace.groupId
    );

    if (!groupMatch) {
      return res.status(403).json({ error: "User not in this group" });
    }

    const userRank = groupMatch.role.rank;
    const allowedRanks = workspace.allowedRanks as number[];

    if (!allowedRanks.includes(userRank)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    
    return res.status(200).json({ success: true, workspace });
  } catch (err: any) {
    console.error("Workspace access error:", err.message);
    return res
      .status(500)
      .json({ error: "Internal Server Error", detail: err.message });
  }
}