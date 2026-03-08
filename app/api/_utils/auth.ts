import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "../../../prisma/Client";

interface JwtPayload extends jwt.JwtPayload {
  id: string;
}

type ActiveUser = {
  id: string;
  robloxId: string;
};

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
      select: { id: true, robloxId: true, isSuspended: true },
    });

    if (!user) {
      return {
        response: NextResponse.json({ error: "User not found" }, { status: 404 }),
      };
    }

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
      ),
    };
  }
}
