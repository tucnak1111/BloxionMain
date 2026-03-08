import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getSessionUserFromToken } from "../../_utils/auth";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("bloxion_auth")?.value;
  const session = await getSessionUserFromToken(token);

  if (!session.user) return session.response;
  return NextResponse.json({ success: true, user: session.user });
}
