import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

// Define the public routes that don't require authentication
const publicRoutes = ["/login", "/api/auth/callback", "/suspended"];

export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Check if the route is public
  const isPublicRoute = publicRoutes.some((publicPath) =>
    path.startsWith(publicPath)
  );

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // 1. Get the token from the cookie
  const cookie = req.cookies.get("bloxion_auth");
  const token = cookie?.value;

  if (!token) {
    // Redirect to login if no token is found
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // 2. Verify the token
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET is not defined in environment variables.");
    }
    jwt.verify(token, secret);
    // If token is valid, proceed to the requested page
    return NextResponse.next();
  } catch (error) {
    console.error("JWT Verification Error:", error);
    // Redirect to login if token is invalid or expired
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

// 3. Configure the matcher
export const config = {
  matcher: ["/((?!api/|_next/static|_next/image|favicon.ico).*)"],
};