import { NextResponse } from "next/server";
import { prisma } from "../../../../prisma/Client";

export async function POST(req: Request) {
  // 1. Read the header safely
  const auth = req.headers.get("x-api-key");

  // 2. Missing API key
  if (auth == null) {
    return NextResponse.json(
      { error: "Unauthorized; no key" },
      { status: 401 }
    );
  }

  // 3. Accept both formats:
  //    - "Bearer TOKEN"
  //    - "TOKEN"
  let token = auth;
  if (auth.startsWith("Bearer ")) {
    token = auth.slice("Bearer ".length);
  }

  // 4. Compare with stored internal key
  if (token !== process.env.INTERNAL_BAN_API_KEY) {
    return NextResponse.json(
      { error: "Unauthorized; wrong key" },
      { status: 401 }
    );
  }

  // 5. Parse request body
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const { robloxId, reason, bannedBy } = body;

  // 6. Validate body fields
  if (!robloxId || !reason) {
    return NextResponse.json(
      { error: "Missing robloxId or reason" },
      { status: 400 }
    );
  }

  // 7. Update user
  await prisma.user.update({
    where: { robloxId },
    data: {
      isSuspended: true,
      suspendedReason: reason,
    },
  });

  // 8. Add to ban log
  await prisma.banLog.create({
    data: {
      userId: robloxId,
      reason,
      bannedBy: bannedBy || "bot",
    },
  });

  // 9. Return success
  return NextResponse.json({ success: true });
}
