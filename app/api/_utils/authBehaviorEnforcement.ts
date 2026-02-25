import { NextRequest } from "next/server";
import { prisma } from "../../../prisma/Client";

type WebhookEmbedField = {
  name: string;
  value: string;
  inline?: boolean;
};

type SessionUser = {
  id: string;
  robloxId: string;
  username: string;
  isSuspended: boolean;
  suspendedReason: string | null;
};

function getPatternsFromEnv(raw: string | undefined): RegExp[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => new RegExp(item, "i"));
}

async function postDiscordWebhook(content: string, fields: WebhookEmbedField[]) {
  const webhookUrl = process.env.STAFF_DISCORD_WEBHOOK_URL;
  if (!webhookUrl) return;

  await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      content,
      embeds: [
        {
          title: "Auth Pattern Detector",
          color: 15158332,
          timestamp: new Date().toISOString(),
          fields,
        },
      ],
    }),
  });
}

export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }

  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp;

  return "unknown";
}

export function hasInappropriateUsername(username: string): string[] {
  const reasons: string[] = [];

  const defaultPatterns = [/\bfuck\b/i, /\bshit\b/i, /\bnigg(?:a|er)\b/i, /\badmin\b/i];
  const custom = getPatternsFromEnv(process.env.AUTH_INAPPROPRIATE_USERNAME_PATTERNS);
  const patterns = [...defaultPatterns, ...custom];

  if (!username || username.length < 3) {
    reasons.push("Username is too short or missing.");
  }

  const isMostlySymbols = /^[^a-zA-Z0-9]+$/.test(username);
  if (isMostlySymbols) {
    reasons.push("Username appears to be symbol-only/gibberish.");
  }

  if (patterns.some((pattern) => pattern.test(username))) {
    reasons.push("Username matched blocked/inappropriate pattern.");
  }

  return reasons;
}

export async function logInvalidAuthAttempt(params: {
  ipAddress: string;
  reason: string;
  path: string;
}) {
  await prisma.authAttempt.create({
    data: {
      ipAddress: params.ipAddress,
      reason: params.reason,
      path: params.path,
    },
  });

  const intervalMinutes = Number(process.env.AUTH_GIBBERISH_WINDOW_MINUTES || 10);
  const threshold = Number(process.env.AUTH_GIBBERISH_THRESHOLD || 8);

  const windowStart = new Date(Date.now() - intervalMinutes * 60 * 1000);

  const attempts = await prisma.authAttempt.count({
    where: {
      ipAddress: params.ipAddress,
      createdAt: { gte: windowStart },
    },
  });

  if (attempts >= threshold) {
    try {
      await postDiscordWebhook("High volume of suspicious auth requests detected.", [
        { name: "IP", value: params.ipAddress, inline: true },
        { name: "Reason", value: params.reason, inline: true },
        { name: "Attempts (window)", value: String(attempts), inline: true },
      ]);
    } catch (error) {
      console.error("Failed to send auth-spam webhook notification:", error);
    }
  }
}

export async function recordSuccessfulLogin(params: {
  userId: string;
  ipAddress: string;
}) {
  await prisma.authLoginEvent.create({
    data: {
      userId: params.userId,
      ipAddress: params.ipAddress,
    },
  });
}

export async function suspendUserForAuthBehavior(params: {
  user: SessionUser;
  ipAddress: string;
  reasons: string[];
}) {
  const reason = `Auto-suspension (auth behavior detector): ${params.reasons.join(" | ")}`;

  await prisma.$transaction([
    prisma.user.update({
      where: { id: params.user.id },
      data: {
        isSuspended: true,
        suspendedReason: reason,
        suspendedAt: new Date(),
      },
    }),
    prisma.banLog.create({
      data: {
        userId: params.user.id,
        reason,
        bannedBy: "auth-behavior-detector",
      },
    }),
  ]);

  try {
    await postDiscordWebhook("A user was automatically suspended during login.", [
      { name: "Username", value: params.user.username, inline: true },
      { name: "Roblox ID", value: params.user.robloxId, inline: true },
      { name: "IP", value: params.ipAddress, inline: true },
      { name: "Reasons", value: params.reasons.join("\n") },
    ]);
  } catch (error) {
    console.error("Failed to send auth-suspension webhook notification:", error);
  }
}

export async function detectAuthSuspensionReasons(params: {
  user: SessionUser;
  ipAddress: string;
}) {
  const reasons = hasInappropriateUsername(params.user.username);

  const bannedIpUsage = await prisma.authLoginEvent.findFirst({
    where: {
      ipAddress: params.ipAddress,
      userId: { not: params.user.id },
      user: { isSuspended: true },
    },
    select: {
      user: { select: { username: true, robloxId: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  if (bannedIpUsage) {
    reasons.push(
      `Login from IP previously used by suspended account ${bannedIpUsage.user.username} (${bannedIpUsage.user.robloxId}).`
    );
  }

  const intervalMinutes = Number(process.env.AUTH_GIBBERISH_WINDOW_MINUTES || 10);
  const threshold = Number(process.env.AUTH_GIBBERISH_THRESHOLD || 8);
  const windowStart = new Date(Date.now() - intervalMinutes * 60 * 1000);

  const recentInvalidAttempts = await prisma.authAttempt.count({
    where: {
      ipAddress: params.ipAddress,
      createdAt: { gte: windowStart },
    },
  });

  if (recentInvalidAttempts >= threshold) {
    reasons.push(
      `IP has ${recentInvalidAttempts} invalid auth attempts in the last ${intervalMinutes} minutes.`
    );
  }

  return reasons;
}
