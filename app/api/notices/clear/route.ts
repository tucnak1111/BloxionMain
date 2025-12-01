import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const BOT_KEY = process.env.NOTICE_BOT_KEY;

export async function POST(req: Request) {
  const auth = req.headers.get("x-bot-key");
  if (auth !== BOT_KEY) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  // Disable all active notices
  await prisma.globalNotice.updateMany({ where: { active: true }, data: { active: false } });

  return NextResponse.json({ ok: true });
}