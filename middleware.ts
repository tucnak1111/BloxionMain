import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const BETA_COOKIE_NAME = "bloxion_beta_access";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("bloxion_auth")?.value;
  const betaAccess = request.cookies.get(BETA_COOKIE_NAME)?.value;
  const isAuthenticated = Boolean(token);
  const hasBetaAccess = betaAccess === "1";
  const { pathname } = request.nextUrl;

  if (pathname === "/") {
    const url = isAuthenticated ? "/workspaces" : hasBetaAccess ? "/login" : "/betaAccess";
    return NextResponse.redirect(new URL(url, request.url));
  }

  if (isAuthenticated && (pathname === "/login" || pathname === "/betaAccess")) {
    return NextResponse.redirect(new URL("/workspaces", request.url));
  }

  if (!hasBetaAccess && pathname !== "/betaAccess") {
    return NextResponse.redirect(new URL("/betaAccess", request.url));
  }

  if (!isAuthenticated && pathname !== "/login" && pathname !== "/betaAccess") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api/|error|_next/static|_next/image|favicon.ico).*)"],
};
