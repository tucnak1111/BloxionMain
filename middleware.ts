import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("bloxion_auth")?.value;
  const url = req.nextUrl.clone();

  // Paths that require authentication
  const protectedPaths = ["/app", "/app/workspaces"];

  const isProtected = protectedPaths.some((path) =>
    url.pathname.startsWith(path)
  );

  if (!isProtected) return NextResponse.next();

  if (!token) {
    url.pathname = "/login";         // redirect to login
    return NextResponse.redirect(url);
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET!);
    return NextResponse.next();
  } catch {
    url.pathname = "/login";        // token invalid or expired
    return NextResponse.redirect(url);
  }
}

// Let Next.js know which routes to match
export const config = {
  matcher: ["/app/:path*"],
};