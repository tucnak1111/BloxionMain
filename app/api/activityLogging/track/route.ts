import { NextResponse } from "next/server";
import { prisma } from "../../../prisma/Client";

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

  const { userId, time } = body;

  // Validate fields
  if (typeof userId !== "number" || typeof time !== "number") {
    return NextResponse.json(
      { error: "Invalid properties; expected { userId: number, time: number }" },
      { status: 400 }
    );
  }

  // Store in the database
  try {
    await prisma.playtime.create({
      data: {
        userId,
        timeSpent: time,
        timestamp: new Date()
      }
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