import { NextResponse } from "next/server";
import { prisma } from "../../../../prisma/Client";
import { Prisma } from "@prisma/client";

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
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { id: true },
    });

    if (!workspace) {
      return NextResponse.json(
        { error: "Workspace not found." },
        { status: 404 }
      );
    }

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
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2003"
    ) {
      return NextResponse.json(
        { error: "Invalid foreign key reference." },
        { status: 400 }
      );
    }

    console.error("Database error:", err);
    return NextResponse.json(
      { error: "Database write failed." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
