import { NextResponse } from "next/server";
import { prisma } from "../../../../prisma/Client";

export async function POST(req: Request) {
  // 1. Authenticate the request using the internal API key
  const auth = req.headers.get("x-api-key");
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized: Missing API key" }, { status: 401 });
  }

  const token = auth.startsWith("Bearer ") ? auth.slice("Bearer ".length) : auth;
  if (token !== process.env.INTERNAL_BAN_API_KEY) {
    return NextResponse.json({ error: "Unauthorized: Invalid API key" }, { status: 401 });
  }

  // 2. Parse and validate the request body
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad Request: Invalid JSON body" }, { status: 400 });
  }

  const { robloxId } = body;
  if (!robloxId) {
    return NextResponse.json({ error: "Bad Request: Missing 'robloxId'" }, { status: 400 });
  }

  try {
    // 3. Find the user to unban
    const userToUnban = await prisma.user.findUnique({
      where: { robloxId },
    });

    // Handle case where user does not exist
    if (!userToUnban) {
      return NextResponse.json({ error: `User with robloxId '${robloxId}' not found.` }, { status: 404 });
    }

    // Handle case where user is not currently banned
    if (!userToUnban.isSuspended) {
      return NextResponse.json(
        { success: true, message: `User ${userToUnban.username} is not currently suspended.` },
        { status: 200 }
      );
    }

    // 4. Update the user's record to lift the suspension
    await prisma.user.update({
      where: { id: userToUnban.id },
      data: {
        isSuspended: false,
        suspendedReason: null,
        suspendedAt: null,
      },
    });

    // 5. Return a success response
    return NextResponse.json({
      success: true,
      message: `User ${userToUnban.username} has been unsuspended.`,
    });

  } catch (error: any) {
    console.error("Failed to process unban:", error);
    return NextResponse.json(
      { error: "An internal database error occurred." },
      { status: 500 }
    );
  }
}
