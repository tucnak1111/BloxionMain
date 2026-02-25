import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { prisma } from "../../../../prisma/Client";
import jwt from "jsonwebtoken";
import {
  detectAuthSuspensionReasons,
  getClientIp,
  logInvalidAuthAttempt,
  recordSuccessfulLogin,
  suspendUserForAuthBehavior,
} from "../../_utils/authBehaviorEnforcement";

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
  const clientIp = getClientIp(req);

  try {
    const allowedRobloxUserIds = validateEnv();

    const code = req.nextUrl.searchParams.get("code");
    const error = req.nextUrl.searchParams.get("error");
    const state = req.nextUrl.searchParams.get("state");
    const cookieState = req.cookies.get("roblox_oauth_state")?.value;

    if (error) {
      await logInvalidAuthAttempt({
        ipAddress: clientIp,
        reason: `oauth-error:${error}`,
        path: req.nextUrl.pathname,
      });
      console.warn("OAuth flow failed or was cancelled by the user.", { error });
      return NextResponse.redirect(new URL("/error", req.url));
    }

    if (!state || !cookieState || state !== cookieState) {
      await logInvalidAuthAttempt({
        ipAddress: clientIp,
        reason: "invalid-oauth-state",
        path: req.nextUrl.pathname,
      });
      return NextResponse.json({ error: "Invalid OAuth state" }, { status: 400 });
    }

    if (!code || typeof code !== "string") {
      await logInvalidAuthAttempt({
        ipAddress: clientIp,
        reason: "missing-or-invalid-auth-code",
        path: req.nextUrl.pathname,
      });
      return NextResponse.json({ error: "Missing or invalid authorization code" }, { status: 400 });
    }

    const accessToken = await exchangeCodeForToken(code);
    const robloxUser = await getRobloxUserInfo(accessToken);

    if (!allowedRobloxUserIds.has(String(robloxUser.sub))) {
      await logInvalidAuthAttempt({
        ipAddress: clientIp,
        reason: `forbidden-roblox-id:${String(robloxUser.sub)}`,
        path: req.nextUrl.pathname,
      });
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const avatarUrl = await getRobloxAvatar(robloxUser.sub);
    const user = await upsertUser(robloxUser, avatarUrl);

    const authPatternReasons = await detectAuthSuspensionReasons({
      user,
      ipAddress: clientIp,
    });

    if (!user.isSuspended && authPatternReasons.length > 0) {
      await suspendUserForAuthBehavior({
        user,
        ipAddress: clientIp,
        reasons: authPatternReasons,
      });

      user.isSuspended = true;
      user.suspendedReason = `Auto-suspension (auth behavior detector): ${authPatternReasons.join(" | ")}`;
    }

    await recordSuccessfulLogin({ userId: user.id, ipAddress: clientIp });

    const token = generateToken(user);
    let response: NextResponse;

    if (user.isSuspended) {
      const reason = encodeURIComponent(user.suspendedReason || "No reason provided");
      const suspendedUrl = new URL("/not-allowed", req.url);
      suspendedUrl.searchParams.set("reason", reason);
      response = NextResponse.redirect(suspendedUrl);
    } else {
      response = NextResponse.redirect(new URL("../../workspaces", req.url));
    }

    response.cookies.set(COOKIE_NAME, token, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: COOKIE_MAX_AGE,
    });

    return response;
  } catch (err: any) {
    await logInvalidAuthAttempt({
      ipAddress: clientIp,
      reason: "callback-internal-error",
      path: req.nextUrl.pathname,
    });

    console.error("Authentication callback failed:", {
      message: err.message,
      responseData: err.response?.data,
      requestConfig: err.config,
    });

    return NextResponse.json(
      { error: "Authentication callback failed. Contact support." },
      { status: 500 }
    );
  }
}
