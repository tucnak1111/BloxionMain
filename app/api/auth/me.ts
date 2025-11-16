import jwt from "jsonwebtoken";
import { prisma } from "../../../prisma/Client";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const cookie = req.cookies.bloxion_auth;
  if (!cookie) return res.status(401).json({ error: "Not logged in" });

  try {
    const decoded = jwt.verify(cookie, process.env.JWT_SECRET!) as { robloxId: string };

    const user = await prisma.user.findUnique({
      where: { robloxId: decoded.robloxId },
      select: {
        id: true,
        robloxId: true,
        username: true,          // optional, remove if you don't have it
        isSuspended: true,
        suspendedReason: true,
      },
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (err) {
    return res.status(403).json({ error: "Invalid or expired session" });
  }
}
