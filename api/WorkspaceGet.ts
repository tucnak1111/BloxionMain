import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../prisma/client";
import axios from "axios";

/**
 * This endpoint verifies if an authenticated user can access a workspace.
 *  - Checks if user is in the Roblox group
 *  - Validates their rank against allowedRanks
 *  - Returns workspace data only if permitted
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { userId, workspaceId } = req.query;

    if (!userId || !workspaceId) {
      return res.status(400).json({ error: "Missing userId or workspaceId" });
    }

    // Find workspace in DB
    const workspace = await prisma.workspace.findUnique({
      where: { id: String(workspaceId) },
    });

    if (!workspace) {
      return res.status(404).json({ error: "Workspace not found" });
    }

    // Fetch Roblox group roles for the user
    const groupRolesRes = await axios.get(
      `https://groups.roblox.com/v2/users/${userId}/groups/roles`
    );
    const userGroups = groupRolesRes.data.data;

    // Find this workspace's group
    const groupMatch = userGroups.find(
      (g: any) => g.group.id.toString() === workspace.groupId
    );

    if (!groupMatch) {
      return res.status(403).json({ error: "User not in this group" });
    }

    const userRank = groupMatch.role.rank;
    const allowedRanks = workspace.allowedRanks as number[];

    // ✅ Check permission
    if (!allowedRanks.includes(userRank)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    // ✅ Authorized
    return res.status(200).json({ success: true, workspace });
  } catch (err: any) {
    console.error("❌ Workspace access error:", err.message);
    return res
      .status(500)
      .json({ error: "Internal Server Error", detail: err.message });
  }
}