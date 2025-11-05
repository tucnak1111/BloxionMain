import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../prisma/client";

/**
 * Returns the authenticated user's info.
 * Expects a user ID or Roblox ID from a session, token, or request header.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Option A: If you already have session middleware, grab it like:
    // const userId = req.session.user.id;

    // Option B: If not, accept a header or query for now
    const { robloxId } = req.query;

    if (!robloxId) {
      return res.status(400).json({ error: "Missing robloxId" });
    }

    // Fetch the user
    const user = await prisma.user.findUnique({
      where: { robloxId: robloxId.toString() },
      include: {
        workspaces: {
          select: {
            id: true,
            groupName: true,
            groupId: true,
            allowedRanks: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (err: any) {
    console.error("❌ Error fetching user:", err.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}