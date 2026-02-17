import { NextResponse } from "next/server";
import { prisma } from "../../../prisma/Client";

const BETA_COOKIE_NAME = "bloxion_beta_access";

async function sendBetaAccessAttemptWebhook(payload: {
  status: "success" | "invalid" | "error";
  codeIdentifier: string;
  attemptedAt: string;
}) {
  const webhookUrl = process.env.DISCORD_BETA_ACCESS_WEBHOOK_URL;
  if (!webhookUrl) {
    return;
  }

  const statusColor = payload.status === "success" ? 0x22c55e : payload.status === "invalid" ? 0xef4444 : 0xf59e0b;

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        embeds: [
          {
            title: "Beta Access Attempt",
            color: statusColor,
            fields: [
              {
                name: "Status",
                value: payload.status,
                inline: true,
              },
              {
                name: "Code Identifier",
                value: payload.codeIdentifier,
                inline: true,
              },
              {
                name: "Attempted At",
                value: payload.attemptedAt,
              },
            ],
            timestamp: payload.attemptedAt,
          },
        ],
      }),
    });
  } catch {
    // Do not block auth flow if webhook delivery fails.
  }
}

export async function POST(request: Request) {
  const attemptedAt = new Date();

  try {
    const { code } = (await request.json()) as { code?: string };
    const normalizedCode = code?.trim();

    if (!normalizedCode) {
      const codeIdentifier = "EMPTY_CODE";

      await prisma.betaAccessAttempt.create({
        data: {
          status: "invalid",
          codeIdentifier,
          attemptedAt,
        },
      });

      await sendBetaAccessAttemptWebhook({
        status: "invalid",
        codeIdentifier,
        attemptedAt: attemptedAt.toISOString(),
      });

      return NextResponse.json(
        { error: "Please provide a beta access code." },
        { status: 400 },
      );
    }

    const betaCode = await prisma.betaAccessCode.findFirst({
      where: {
        code: normalizedCode,
        isActive: true,
      },
      select: {
        id: true,
      },
    });

    if (!betaCode) {
      const codeIdentifier = `UNMATCHED:${normalizedCode.slice(0, 24)}`;

      await prisma.betaAccessAttempt.create({
        data: {
          status: "invalid",
          codeIdentifier,
          attemptedAt,
        },
      });

      await sendBetaAccessAttemptWebhook({
        status: "invalid",
        codeIdentifier,
        attemptedAt: attemptedAt.toISOString(),
      });

      return NextResponse.json(
        { error: "Invalid beta access code." },
        { status: 401 },
      );
    }

    await prisma.betaAccessAttempt.create({
      data: {
        status: "success",
        codeIdentifier: betaCode.id,
        betaAccessCodeId: betaCode.id,
        attemptedAt,
      },
    });

    await sendBetaAccessAttemptWebhook({
      status: "success",
      codeIdentifier: betaCode.id,
      attemptedAt: attemptedAt.toISOString(),
    });

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
    const codeIdentifier = "SERVER_ERROR";

    await prisma.betaAccessAttempt
      .create({
        data: {
          status: "error",
          codeIdentifier,
          attemptedAt,
        },
      })
      .catch(() => null);

    await sendBetaAccessAttemptWebhook({
      status: "error",
      codeIdentifier,
      attemptedAt: attemptedAt.toISOString(),
    });

    return NextResponse.json(
      { error: "Failed to validate beta access code." },
      { status: 500 },
    );
  }
}
