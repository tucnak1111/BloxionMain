import axios from "axios";
import { prisma } from "@/prisma/Client";
import jwt from "jsonwebtoken";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  if (!code) {
    return Response.json({ error: "Missing authorization code" }, { status: 400 });
  }

  try {
    // Exchange authorization code for access token
    const tokenRes = await axios.post(
      "https://apis.roblox.com/oauth/v1/token",
      new URLSearchParams({
        grant_type: "authorization_code",
        code,
        client_id: process.env.ROBLOX_CLIENT_ID!,
        client_secret: process.env.ROBLOX_CLIENT_SECRET!,
        redirect_uri: process.env.ROBLOX_REDIRECT_URI!,
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const accessToken = tokenRes.data.access_token;

    // Fetch user info
    const userInfoRes = await axios.get(
      "https://apis.roblox.com/oauth/v1/userinfo",
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    const robloxUser = userInfoRes.data;

    // Fetch Roblox avatar
    const avatarRes = await axios.get(
      `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${robloxUser.sub}&size=150x150&format=Png&isCircular=true`
    );
    const avatarUrl = avatarRes.data.data?.[0]?.imageUrl ?? null;

    // Upsert into Prisma
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

    // Create JWT token
    const token = jwt.sign(
      { id: user.id, robloxId: user.robloxId, username: user.username },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    const headers = new Headers();
    headers.append(
      "Set-Cookie",
      `bloxion_auth=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=604800`
    );

    // If suspended → redirect
    if (user.isSuspended) {
      const reason = encodeURIComponent(user.suspendedReason || "No reason provided");
      headers.append("Location", `/suspended?reason=${reason}`);
      return new Response(null, { status: 302, headers });
    }

    // Success → redirect
    headers.append("Location", "/");
    return new Response(null, { status: 302, headers });

  } catch (err: any) {
    console.error("Auth callback error:", err.response?.data || err.message);
    return Response.json({ error: "Authentication failed" }, { status: 500 });
  }
}