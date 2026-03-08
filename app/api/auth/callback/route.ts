import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { prisma } from "../../../../prisma/Client";
import jwt from "jsonwebtoken";

const {
  ROBLOX_CLIENT_ID,
  ROBLOX_CLIENT_SECRET,
  ROBLOX_REDIRECT_URI,
  JWT_SECRET,
  ALLOWED_ROBLOX_USER_IDS,
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
function validateEnv(): Set<string> {
  if (!ROBLOX_CLIENT_ID || !ROBLOX_CLIENT_SECRET || !ROBLOX_REDIRECT_URI || !JWT_SECRET) {
    console.error("Missing one or more required environment variables for Roblox OAuth.");
    throw new Error("Server configuration error.");
  }
  const allowedRobloxUserIds = new Set(
    (ALLOWED_ROBLOX_USER_IDS || "")
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean)
  );
  if (allowedRobloxUserIds.size === 0) {
    console.error("ALLOWED_ROBLOX_USER_IDS must contain at least one valid Roblox user ID.");
    throw new Error("Server configuration error.");
  }
  return allowedRobloxUserIds;
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
async function getUsername(userId: string): Promise<{
  username: string;
  displayName: string;
}> {
  const { data } = await axios.get(`https://users.roblox.com/v1/users/${userId}`);
  return { username: data.name, displayName: data.displayName };
}

async function upsertUser(robloxUser: any, avatarUrl: string | null) {

  const { username, displayName } = await getUsername(robloxUser.sub);

  return prisma.user.upsert({
    where: { robloxId: robloxUser.sub },
    update: { username, displayName, avatarUrl },
    create: {
      robloxId: robloxUser.sub,
      username,
      displayName,
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

function generateToken(user: any) {
  return jwt.sign(
    { id: user.id, robloxId: user.robloxId, username: user.username },
    JWT_SECRET!,
    { expiresIn: "7d" }
  );
}

export async function GET(req: NextRequest) {
  try {
    const allowedRobloxUserIds = validateEnv();

    const code = req.nextUrl.searchParams.get("code");
    const error = req.nextUrl.searchParams.get("error");

    // Handle OAuth cancellation or errors from Roblox
    if (error) {
      console.warn("OAuth flow failed or was cancelled by the user.", { error });
      return NextResponse.redirect(new URL("/error", req.url));
    }

    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "Missing or invalid authorization code" }, { status: 400 });
    }

    // 1. Exchange authorization code for an access token
    const accessToken = await exchangeCodeForToken(code);

    // 2. Fetch user info and avatar from Roblox APIs
    const robloxUser = await getRobloxUserInfo(accessToken);

    if (!allowedRobloxUserIds.has(String(robloxUser.sub))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const avatarUrl = await getRobloxAvatar(robloxUser.sub);

    // 3. Create or update the user in the database
    const user = await upsertUser(robloxUser, avatarUrl);

    let response: NextResponse;

    // 5. Redirect based on user suspension status
    if (user.isSuspended) {
      const reason = encodeURIComponent(user.suspendedReason || "No reason provided");
      const suspendedUrl = new URL("/not-allowed", req.url);
      suspendedUrl.searchParams.set("reason", reason);
      response = NextResponse.redirect(suspendedUrl);
      response.cookies.set(COOKIE_NAME, "", {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 0,
      });
    } else {
      // 4. Generate session token only for active users
      const token = generateToken(user);
      response = NextResponse.redirect(new URL("../../workspaces", req.url));
      // Set the cookie on the response object
      response.cookies.set(COOKIE_NAME, token, {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: COOKIE_MAX_AGE,
      });
    }

    return response;
  } catch (err: any) {
    console.error("Authentication callback failed:", {
      message: err.message,
      responseData: err.response?.data,
      requestConfig: err.config,
    });


    const error = {
      error: "Authentication callback failed. Contact support.",
    };
    return NextResponse.json(error, { status: 500 });

  }
}
