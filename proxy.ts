import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = new Set(["/login", "/error"]);

function decodeBase64Url(value: string) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(base64 + padding);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

async function verifyAuthToken(token: string) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error("JWT_SECRET is not configured.");
    return false;
  }

  const parts = token.split(".");
  if (parts.length !== 3) {
    return false;
  }

  const [encodedHeader, encodedPayload, encodedSignature] = parts;

  try {
    const headerJson = JSON.parse(new TextDecoder().decode(decodeBase64Url(encodedHeader)));
    if (headerJson.alg !== "HS256") {
      return false;
    }

    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const validSignature = await crypto.subtle.verify(
      "HMAC",
      key,
      decodeBase64Url(encodedSignature),
      new TextEncoder().encode(`${encodedHeader}.${encodedPayload}`)
    );

    if (!validSignature) {
      return false;
    }

    const payloadJson = JSON.parse(new TextDecoder().decode(decodeBase64Url(encodedPayload)));
    if (typeof payloadJson.exp === "number" && payloadJson.exp * 1000 <= Date.now()) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

async function getSuspensionState(
  request: NextRequest,
  token: string
): Promise<boolean | null> {
  try {
    const response = await fetch(new URL("/api/auth/me", request.url), {
      headers: {
        cookie: `bloxion_auth=${token}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return Boolean(data?.user?.isSuspended);
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const token = request.cookies.get("bloxion_auth")?.value;
  const isAuthenticated = token ? await verifyAuthToken(token) : false;
  const { pathname } = request.nextUrl;
  const isProtectedPath = !PUBLIC_PATHS.has(pathname);
  let suspended: boolean | null = null;

  if (isAuthenticated && token) {
    suspended = await getSuspensionState(request, token);
    if (suspended === null) {
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("bloxion_auth");
      return response;
    }
  }

  if (pathname === "/") {
    const url = !isAuthenticated ? "/login" : suspended ? "/not-allowed" : "/workspaces";
    return NextResponse.redirect(new URL(url, request.url));
  }

  if (isAuthenticated && suspended && pathname !== "/not-allowed") {
    return NextResponse.redirect(new URL("/not-allowed", request.url));
  }

  if (isAuthenticated && !suspended && pathname === "/not-allowed") {
    return NextResponse.redirect(new URL("/workspaces", request.url));
  }

  if (isAuthenticated && pathname === "/login") {
    const url = suspended ? "/not-allowed" : "/workspaces";
    return NextResponse.redirect(new URL(url, request.url));
  }

  if (!isAuthenticated && isProtectedPath) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    if (token) {
      response.cookies.delete("bloxion_auth");
    }
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api/|_next/static|_next/image|favicon.ico).*)"],
};
