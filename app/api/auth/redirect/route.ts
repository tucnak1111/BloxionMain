import { NextResponse } from "next/server";

export function GET() {
  const { ROBLOX_CLIENT_ID, ROBLOX_REDIRECT_URI } = process.env;

  if (!ROBLOX_CLIENT_ID || !ROBLOX_REDIRECT_URI) {
    console.error("Roblox client ID or redirect URI is not configured.");
    return NextResponse.json(
      { error: "Server configuration error." },
      { status: 500 }
    );
  }

  // Define the required scopes for the OAuth flow
  const scope = "openid profile";

  // Construct the authorization URL
  const params = new URLSearchParams({
    client_id: ROBLOX_CLIENT_ID,
    redirect_uri: ROBLOX_REDIRECT_URI,
    scope: scope,
    response_type: "code",
  });

  const authorizationUrl = `https://apis.roblox.com/oauth/v1/authorize?${params.toString()}`;

  // Redirect the user to the Roblox authorization page
  return NextResponse.redirect(authorizationUrl);
}