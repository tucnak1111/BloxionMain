import { NextResponse } from "next/server";
import { prisma } from "../../../../prisma/Client";

export async function POST(req: Request) {
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

  // Store in the database
  try {
    await prisma.workspacePlaytime.upsert({
      where: { robloxId_workspaceId: { robloxId, workspaceId } },
      update: { seconds: { increment: seconds } },
      data: {
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