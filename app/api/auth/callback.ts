import axios from "axios";
import { prisma } from "../../../prisma/Client";
import jwt from "jsonwebtoken";
import { NextApiRequest, NextApiResponse } from "next/types";

const {
  ROBLOX_CLIENT_ID,
  ROBLOX_CLIENT_SECRET,
  ROBLOX_REDIRECT_URI,
  JWT_SECRET,
} = process.env;

const robloxApi = {
  tokenUrl: "https://apis.roblox.com/oauth/v1/token",
  userInfoUrl: "https://apis.roblox.com/oauth/v1/userinfo",
  avatarUrl: (userId: string) =>
    `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=150x150&format=Png&isCircular=true`,
};

const COOKIE_NAME = "bloxion_auth";
const COOKIE_MAX_AGE = 604800; // 7 days in seconds

/**
 * Validates that all required environment variables are present.
 */
function validateEnv() {
  if (!ROBLOX_CLIENT_ID || !ROBLOX_CLIENT_SECRET || !ROBLOX_REDIRECT_URI || !JWT_SECRET) {
    console.error("Missing one or more required environment variables for Roblox OAuth.");
    throw new Error("Server configuration error.");
  }
}

async function exchangeCodeForToken(code: string) {
  const { data } = await axios.post(
    robloxApi.tokenUrl,
    new URLSearchParams({
      grant_type: "authorization_code",
      code,
      client_id: ROBLOX_CLIENT_ID!,
      client_secret: ROBLOX_CLIENT_SECRET!,
      redirect_uri: ROBLOX_REDIRECT_URI!,
    }),
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
  );
  return data.access_token;
}

async function getRobloxUserInfo(accessToken: string) {
  const { data } = await axios.get(robloxApi.userInfoUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return data;
}

async function getRobloxAvatar(userId: string): Promise<string | null> {
  try {
    const { data } = await axios.get(robloxApi.avatarUrl(userId));
    return data.data[0]?.imageUrl || null;
  } catch (error) {
    console.warn(`Could not fetch avatar for user ${userId}:`, error);
    return null;
  }
}

async function upsertUser(robloxUser: any, avatarUrl: string | null) {
  return prisma.user.upsert({
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
}

function createSession(res: NextApiResponse, user: any) {
  const token = jwt.sign(
    { id: user.id, robloxId: user.robloxId, username: user.username },
    JWT_SECRET!,
    { expiresIn: "7d" }
  );

  const cookieOptions = [
    `${COOKIE_NAME}=${token}`,
    "Path=/",
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
    `Max-Age=${COOKIE_MAX_AGE}`,
  ];

  res.setHeader("Set-Cookie", cookieOptions.join("; "));
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    validateEnv();

    const { code } = req.query;
    if (!code || typeof code !== "string") {
      return res.status(400).json({ error: "Missing or invalid authorization code" });
    }

    // 1. Exchange authorization code for an access token
    const accessToken = await exchangeCodeForToken(code);

    // 2. Fetch user info and avatar from Roblox APIs
    const robloxUser = await getRobloxUserInfo(accessToken);
    const avatarUrl = await getRobloxAvatar(robloxUser.sub);

    // 3. Create or update the user in the database
    const user = await upsertUser(robloxUser, avatarUrl);

    // 4. Create a session and set the authentication cookie
    createSession(res, user);

    // 5. Redirect based on user suspension status
    if (user.isSuspended) {
      const reason = encodeURIComponent(user.suspendedReason || "No reason provided");
      return res.redirect(`/suspended?reason=${reason}`);
    }

    return res.redirect("../../workspaces");
  } catch (err: any) {
    const errorMessage = err.response?.data || err.message || "An unknown error occurred";
    console.error("Authentication callback failed:", {
      message: err.message,
      responseData: err.response?.data,
      requestConfig: err.config,
    });

    // Avoid exposing detailed internal errors to the client
    const clientMessage = err.message === "Server configuration error."
      ? err.message
      : "Authentication failed due to a server error.";

    return res.status(500).json({ error: clientMessage });
  }
}
