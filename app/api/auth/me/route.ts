import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/prisma/Client"; // adjust if needed

export async function GET(req: Request) {
  const cookie = req.headers.get("cookie");
  const token = cookie
    ?.split("; ")
    .find((c) => c.startsWith("bloxion_auth="))
    ?.split("bloxion_auth=")[1];

  if (!token) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      robloxId: string;
    };

    const user = await prisma.user.findUnique({
      where: { robloxId: decoded.robloxId },
      select: {
        id: true,
        robloxId: true,
        username: true,
        isSuspended: true,
        suspendedReason: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, user });
  } catch {
    return NextResponse.json(
      { error: "Invalid or expired session" },
      { status: 403 }
    );
  }
}