import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true });

  response.headers.set(
    "Set-Cookie",
    `bloxion_auth=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`
  );

  return response;
}
