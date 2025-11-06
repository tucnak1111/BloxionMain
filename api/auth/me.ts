import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const cookie = req.cookies.bloxion_auth;
  if (!cookie) return res.status(401).json({ error: "Not logged in" });

  try {
    const decoded = jwt.verify(cookie, process.env.JWT_SECRET!) as { robloxId: string };
    const user = await prisma.user.findUnique({ where: { robloxId: decoded.robloxId } });
    if (!user) return res.status(404).json({ error: "User not found" });

    return res.json({ success: true, user });
  } catch {
    return res.status(403).json({ error: "Invalid or expired token" });
  }
}