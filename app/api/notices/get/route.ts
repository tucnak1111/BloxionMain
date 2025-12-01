// GET - public
import { NextResponse } from "next/server";
import prisma from "../../../../prisma/Client"; // your prisma client

export async function GET() {
  const notice = await prisma.global_notice.findFirst({
    where: { active: true },
    orderBy: { updatedAt: "desc" },
  });

  if (!notice) return NextResponse.json(null);

  return NextResponse.json({
    id: notice.id,
    type: notice.type,
    text: notice.text,
    author_name: notice.author_name,
    author_avatar: notice.author_avatar,
    updatedAt: notice.updatedAt.toISOString(),
  });
}