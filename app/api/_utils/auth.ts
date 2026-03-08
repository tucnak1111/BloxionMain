<<<<<<< HEAD
import { cookies } from "next/headers";
=======
>>>>>>> 5a31552bd822e8986360676ef2caac43cf2492c1
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "../../../prisma/Client";

interface JwtPayload extends jwt.JwtPayload {
  id: string;
}

<<<<<<< HEAD
type ActiveUser = {
=======
export type ActiveUser = {
>>>>>>> 5a31552bd822e8986360676ef2caac43cf2492c1
  id: string;
  robloxId: string;
};

<<<<<<< HEAD
type ActiveUserResult =
  | { user: ActiveUser; response?: never }
  | { user?: never; response: NextResponse };

export async function requireActiveUser(): Promise<ActiveUserResult> {
  const token = (await cookies()).get("bloxion_auth")?.value;
  if (!token) {
    return {
      response: NextResponse.json(
        { error: "Unauthorized: Not logged in" },
        { status: 401 }
      ),
=======
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
>>>>>>> 5a31552bd822e8986360676ef2caac43cf2492c1
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
<<<<<<< HEAD
      select: { id: true, robloxId: true, isSuspended: true },
=======
      select: {
        id: true,
        robloxId: true,
        username: true,
        isSuspended: true,
        suspendedReason: true,
      },
>>>>>>> 5a31552bd822e8986360676ef2caac43cf2492c1
    });

    if (!user) {
      return {
        response: NextResponse.json({ error: "User not found" }, { status: 404 }),
      };
    }

<<<<<<< HEAD
    if (user.isSuspended) {
      return {
        response: NextResponse.json(
          { error: "Forbidden: Account suspended" },
          { status: 403 }
        ),
      };
    }

    return { user: { id: user.id, robloxId: user.robloxId } };
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return {
        response: NextResponse.json(
          { error: "Invalid or expired session" },
          { status: 403 }
        ),
      };
    }

    console.error("Authentication error:", error);
    return {
      response: NextResponse.json(
        { error: "An internal server error occurred." },
        { status: 500 }
=======
    return { user };
  } catch (error) {
    return {
      response: NextResponse.json(
        { error: "Invalid or expired session" },
        { status: 403 }
>>>>>>> 5a31552bd822e8986360676ef2caac43cf2492c1
      ),
    };
  }
}
<<<<<<< HEAD
=======

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
>>>>>>> 5a31552bd822e8986360676ef2caac43cf2492c1
