import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "../../../../prisma/Client";

export async function GET() {
  const cookieStore = cookies();
  const token = (await cookieStore).get("bloxion_auth")?.value;

  if (!token) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error("JWT_SECRET is not defined in environment variables.");
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  }

  try {
    const decoded = jwt.verify(token, secret) as { robloxId: string };

    const user = await prisma.user.findUnique({
      where: { robloxId: decoded.robloxId },
      select: {
        id: true,
        robloxId: true,
        username: true, // optional, remove if you don't have it
        isSuspended: true,
        suspendedReason: true,
      },
    });

    if (!user) {
      // To prevent user enumeration, you might want to return a generic error.
      // However, returning 404 can be useful for debugging on the client.
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("JWT verification failed:", error);
    return NextResponse.json(
      { error: "Invalid or expired session" },
      { status: 403 }
    );
  }
}