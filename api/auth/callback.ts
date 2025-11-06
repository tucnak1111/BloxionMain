import axios from "axios";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { code } = req.query;
  if (!code) return res.status(400).json({ error: "Missing authorization code" });

  try {
    const tokenResponse = await axios.post(
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

    const { access_token } = tokenResponse.data;

    // Fetch Roblox user info
    const userInfo = await axios.get("https://apis.roblox.com/oauth/v1/userinfo", {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const robloxUser = userInfo.data;

    // Fetch avatar (optional)
    const avatarRes = await axios.get(
      `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${robloxUser.sub}&size=150x150&format=Png&isCircular=true`
    );
    const avatarUrl = avatarRes.data.data[0]?.imageUrl || null;

    // Store or update user in DB
    const user = await prisma.user.upsert({
      where: { robloxId: robloxUser.sub },
      update: { username: robloxUser.name, avatarUrl },
      create: {
        robloxId: robloxUser.sub,
        username: robloxUser.name,
        avatarUrl,
      },
    });

    // Create a JWT
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

    res.redirect("/"); // redirect to dashboard or homepage
  } catch (err: any) {
    console.error("OAuth error:", err.response?.data || err.message);
    res.status(500).json({ error: "Authentication failed" });
  }
}