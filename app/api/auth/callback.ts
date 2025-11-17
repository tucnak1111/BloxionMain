import axios from "axios";
import { prisma } from "../../../prisma/Client";
import jwt from "jsonwebtoken";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { code } = req.query;
  if (!code) return res.status(400).json({ error: "Missing authorization code" });

  try {
    // Exchange the authorization code for an access token
    const tokenRes = await axios.post(
      "https://apis.roblox.com/oauth/v1/token",
      new URLSearchParams({
        grant_type: "authorization_code",
        code: code.toString(),
        client_id: process.env.ROBLOX_CLIENT_ID!,
        client_secret: process.env.ROBLOX_CLIENT_SECRET!,
        redirect_uri: process.env.ROBLOX_REDIRECT_URI!,
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const accessToken = tokenRes.data.access_token;

    // Fetch user info from Roblox OAuth
    const userInfoRes = await axios.get("https://apis.roblox.com/oauth/v1/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const robloxUser = userInfoRes.data;

    // Fetch Roblox avatar
    const avatarRes = await axios.get(
      `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${robloxUser.sub}&size=150x150&format=Png&isCircular=true`
    );
    const avatarUrl = avatarRes.data.data[0]?.imageUrl || null;

    // 🔹 Upsert user in Prisma
    const user = await prisma.user.upsert({
      where: { robloxId: robloxUser.sub },
      update: { username: robloxUser.name, avatarUrl },
      create: {
        robloxId: robloxUser.sub,
        username: robloxUser.name,
        avatarUrl,
      },
      select: {
        id: true,
        robloxId: true,
        username: true,
        isSuspended: true,
        suspendedReason: true,
      },
    });

    // ✍ Create session token
    const token = jwt.sign(
      { id: user.id, robloxId: user.robloxId, username: user.username },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    // Set auth cookie
    res.setHeader(
      "Set-Cookie",
      `bloxion_auth=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=604800`
    );

    // If suspended → redirect immediately
    if (user.isSuspended) {
      const reason = encodeURIComponent(user.suspendedReason || "No reason provided");
      return res.redirect(`/suspended?reason=${reason}`);
    }

    // 🎉 Otherwise → redirect to app/dashboard
    return res.redirect("../../workspaces");
  } catch (err: any) {
    console.error("Auth callback error:", err.response?.data || err.message);
    return res.status(500).json({ error: "Authentication failed" });
  }
}
