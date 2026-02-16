import { NextResponse } from "next/server";
import { prisma } from "../../../../prisma/Client";

export async function POST(req: Request) {
  const providedApiKey = req.headers.get("x-api-key");
  const configuredApiKey = process.env.ACTIVITY_TRACKING_API_KEY;

  if (!configuredApiKey) {
    console.error("ACTIVITY_TRACKING_API_KEY is not configured.");
    return NextResponse.json(
      { error: "Tracking API key is not configured." },
      { status: 500 }
    );
  }

  if (!providedApiKey || providedApiKey !== configuredApiKey) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  let body;

  // Parse JSON safely
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body." },
      { status: 400 }
    );
  }

  const { robloxId, workspaceId, seconds } = body;

  // Validate fields
  if (typeof robloxId !== "string" || typeof workspaceId !== "string" || typeof seconds !== "number") {
    return NextResponse.json(
      { error: "Invalid properties; expected { robloxId: string, workspaceId: string, seconds: number }" },
      { status: 400 }
    );
  }

  if (!Number.isInteger(seconds) || seconds <= 0 || seconds > 3600) {
    return NextResponse.json(
      { error: "Invalid seconds value; expected an integer between 1 and 3600." },
      { status: 400 }
    );
  }

  // Store in the database
  try {
    await prisma.workspacePlaytime.upsert({
      where: { robloxId_workspaceId: { robloxId, workspaceId } },
      update: { seconds: { increment: seconds } },
      create: {
        robloxId,
        workspaceId,
        seconds,
      },
    });
  } catch (err) {
    console.error("Database error:", err);
    return NextResponse.json(
      { error: "Database write failed." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
