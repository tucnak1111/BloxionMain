import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const BOT_KEY = process.env.NOTICE_BOT_KEY; // keep secret in Vercel/Env

export async function POST(req: Request) {
  const auth = req.headers.get("x-bot-key");
  if (auth !== BOT_KEY) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json();
  const { type, text, author_name, author_avatar } = body;

  // Basic validation
  if (!type || !text) return NextResponse.json({ error: "missing fields" }, { status: 400 });

  // Option A: mark all existing as inactive then create new
  await prisma.globalNotice.updateMany({ where: { active: true }, data: { active: false } });

  const notice = await prisma.globalNotice.create({
    data: { type, text, author_name, author_avatar, active: true },
  });

  return NextResponse.json({
    id: notice.id,
    updatedAt: notice.updatedAt.toISOString(),
  });
}