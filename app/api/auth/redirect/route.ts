import { NextResponse } from "next/server";

export async function GET() {
  const ROBLOX_CLIENT_ID = process.env.ROBLOX_CLIENT_ID!;
  const REDIRECT_URI = process.env.ROBLOX_REDIRECT_URI!;
  const state = crypto.randomUUID();

  const authUrl = `https://apis.roblox.com/oauth/v1/authorize?client_id=${ROBLOX_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(
    REDIRECT_URI
  )}&scope=openid%20profile&state=${state}`;

  // Redirect exactly like before (just using NextResponse)
  return NextResponse.redirect(authUrl);
}