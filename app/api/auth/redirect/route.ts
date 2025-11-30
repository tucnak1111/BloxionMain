import { NextResponse } from "next/server";
import { cookies } from "next/headers";
export function GET() {
  const ROBLOX_CLIENT_ID = process.env.ROBLOX_CLIENT_ID!;
  const REDIRECT_URI = process.env.ROBLOX_REDIRECT_URI!;
  const STATE = crypto.randomUUID();

  cookies().set("roblox_oauth_state", STATE, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 300,
  });
  const authUrl = `https://apis.roblox.com/oauth/v1/authorize?client_id=${ROBLOX_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(
    REDIRECT_URI
  )}&scope=openid%20profile&state=${STATE}`;

  return NextResponse.redirect(authUrl);
}
