import { NextResponse } from "next/server";
import { prisma } from "../../../prisma/Client";

const BETA_COOKIE_NAME = "bloxion_beta_access";

export async function POST(request: Request) {
  try {
    const { code } = (await request.json()) as { code?: string };

    if (!code?.trim()) {
      return NextResponse.json(
        { error: "Please provide a beta access code." },
        { status: 400 },
      );
    }

    const betaCode = await prisma.betaAccessCode.findFirst({
      where: {
        code: code.trim(),
        isActive: true,
      },
      select: {
        id: true,
      },
    });

    if (!betaCode) {
      return NextResponse.json(
        { error: "Invalid beta access code." },
        { status: 401 },
      );
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set(BETA_COOKIE_NAME, "1", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: "Failed to validate beta access code." },
      { status: 500 },
    );
  }
}
