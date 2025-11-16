import { NextResponse } from "next/server";
import { prisma } from "../../../../prisma/Client";

export async function POST(req: Request) {
  const auth = req.headers.get("x-api-key");
  if (auth !== process.env.INTERNAL_BAN_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { robloxId, reason, bannedBy } = body;

  if (!robloxId || !reason) {
    return NextResponse.json({ error: "Missing robloxId or reason" }, { status: 400 });
  }

  await prisma.user.update({
    where: { robloxId },
    data: {
      isSuspended: true,
      suspendedReason: reason,
    },
  });

  await prisma.banLog.create({
    data: {
      userId: robloxId,
      reason,
      bannedBy: bannedBy || "bot",
    },
  });

  return NextResponse.json({ success: true });
}
