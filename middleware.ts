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

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("bloxion_auth")?.value;
  const isAuthenticated = token ? await verifyAuthToken(token) : false;
  const { pathname } = request.nextUrl;

  if (pathname === "/") {
    const url = isAuthenticated ? "/workspaces" : "/login";
    return NextResponse.redirect(new URL(url, request.url));
  }

  if (isAuthenticated && pathname === "/login") {
    return NextResponse.redirect(new URL("/workspaces", request.url));
  }

  if (!isAuthenticated && !PUBLIC_PATHS.has(pathname)) {
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
