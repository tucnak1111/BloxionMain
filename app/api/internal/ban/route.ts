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

  try {
    // 7. Find the user by their Roblox ID
    const userToBan = await prisma.user.findUnique({
      where: { robloxId },
    });

    // If the user doesn't exist in our database, we can't ban them.
    if (!userToBan) {
      return NextResponse.json({ error: `User with robloxId '${robloxId}' not found.` }, { status: 404 });
    }

    // 8. Perform the ban and logging in a single transaction
    await prisma.$transaction([
      // Update the user record
      prisma.user.update({
        where: { id: userToBan.id },
        data: {
          isSuspended: true,
          suspendedReason: reason,
          suspendedAt: new Date(),
        },
      }),
      // Create a corresponding log entry using the user's primary ID
      prisma.banLog.create({
        data: {
          userId: userToBan.id, // Use the user's CUID for consistency
          reason,
          bannedBy: bannedBy || "bot",
        },
      }),
    ]);

    // 9. Return success
    return NextResponse.json({ success: true, message: `User ${userToBan.username} has been banned.` });
  } catch (error: any) {
    console.error("Failed to process ban:", error);
    return NextResponse.json({ error: "An internal database error occurred." }, { status: 500 });
  }
}
