import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("bloxion_auth")?.value;
  const isAuthenticated = Boolean(token);
  const { pathname } = request.nextUrl;

  // If user is on the root path, redirect them based on auth status
  if (pathname === "/") {
    const url = isAuthenticated ? "/workspaces" : "/login";
    return NextResponse.redirect(new URL(url, request.url));
  }

  // If the user is authenticated
  if (isAuthenticated) {
    // If they try to access the login page, redirect them to workspaces
    if (pathname === "/login") {
      return NextResponse.redirect(new URL("/workspaces", request.url));
    }
  }

  // If the user is not authenticated and trying to access a protected page
  if (!isAuthenticated && !pathname.startsWith("/login")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // The matcher excludes API routes, static files, and the login page itself
  matcher: ["/((?!api/|login|error|_next/static|_next/image|favicon.ico).*)"],
};
