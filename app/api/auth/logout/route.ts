import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function GET(req: NextRequest) {
  // The URL to redirect to after logout
  const redirectURL = new URL("/login", req.url);

  // Create a response object to set the cookie on
  const response = NextResponse.redirect(redirectURL);

  // Clear the authentication cookie by setting its Max-Age to 0
  response.cookies.set("bloxion_auth", "", {
    httpOnly: true,
    path: "/",
    secure: process.env.NODE_ENV !== "development",
    maxAge: 0,
  });

  return response;
}