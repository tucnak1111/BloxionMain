import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "../../../prisma/Client";

interface JwtPayload extends jwt.JwtPayload {
  id: string;
}

export type ActiveUser = {
  id: string;
  robloxId: string;
};

export type SessionUser = {
  id: string;
  robloxId: string;
  username: string | null;
  isSuspended: boolean;
  suspendedReason: string | null;
};

type ActiveUserAuthResult =
  | { user: ActiveUser; response?: never }
  | { user?: never; response: NextResponse };

type SessionUserAuthResult =
  | { user: SessionUser; response?: never }
  | { user?: never; response: NextResponse };

export async function getSessionUserFromToken(
  token: string | undefined
): Promise<SessionUserAuthResult> {
  if (!token) {
    return {
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error("JWT_SECRET is not defined in environment variables.");
    return {
      response: NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      ),
    };
  }

  try {
    const decoded = jwt.verify(token, secret) as JwtPayload;
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        robloxId: true,
        username: true,
        isSuspended: true,
        suspendedReason: true,
      },
    });

    if (!user) {
      return {
        response: NextResponse.json({ error: "User not found" }, { status: 404 }),
      };
    }

    return { user };
  } catch (error) {
    return {
      response: NextResponse.json(
        { error: "Invalid or expired session" },
        { status: 403 }
      ),
    };
  }
}

export async function requireActiveUserFromToken(
  token: string | undefined
): Promise<ActiveUserAuthResult> {
  const session = await getSessionUserFromToken(token);
  if (!session.user) {
    return { response: session.response };
  }

  if (session.user.isSuspended) {
    return {
      response: NextResponse.json({ error: "Forbidden: Account suspended" }, { status: 403 }),
    };
  }

  return {
    user: {
      id: session.user.id,
      robloxId: session.user.robloxId,
    },
  };
}
