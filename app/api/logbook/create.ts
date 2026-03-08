import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { prisma } from "../../../prisma/Client";
import { User } from "@prisma/client";
import { requireActiveUser } from "../_utils/auth";

/**
 * Authenticates a user from a session cookie.
 */
async function authenticateWithCookie(): Promise<User | null> {
  const auth = await requireActiveUser();
  if (auth.response) return null;
  return prisma.user.findUnique({ where: { id: auth.user.id } });
}

/**
 * Hashes an API key using SHA-256.
 */
function hashApiKey(apiKey: string): string {
  return createHash("sha256").update(apiKey).digest("hex");
}

/**
 * Authenticates a user from an API key in the Authorization header.
 */
async function authenticateWithApiKey(authHeader: string | null): Promise<{ user: User; apiKeyData: { permissions: string[] } } | null> {
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;

  const apiKey = authHeader.split(" ")[1];
  const hashedKey = hashApiKey(apiKey);

  // Find the key by its hash, not the raw value.
  const apiKeyData = await prisma.apiKey.findUnique({
    where: { key: hashedKey },
    include: { user: true },
  });

  if (!apiKeyData || !apiKeyData.user || apiKeyData.user.isSuspended) return null;
  return { user: apiKeyData.user, apiKeyData };
}

export async function POST(req: NextRequest) {
  let authMethod: "cookie" | "apiKey" = "cookie";

  try {
    // 1. Attempt to authenticate the user
    const authHeader = req.headers.get("Authorization");
    let authResult = await authenticateWithApiKey(authHeader);
    let user: User | null = authResult?.user || null;

    // If API key authentication fails or is not provided, try cookie authentication
    if (!user) {
      user = await authenticateWithCookie();
    } else {
      authMethod = "apiKey";
    }

    // If neither method works, deny access
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized: Authentication failed." },
        { status: 401 }
      );
    }

    if (user.isSuspended) {
      return NextResponse.json(
        { error: "Forbidden: Account suspended" },
        { status: 403 }
      );
    }

    // 2. Parse and validate the request body
    const body = await req.json();
    const { title, content, workspaceId } = body;

    if (!title || !workspaceId) {
      return NextResponse.json(
        { error: "Bad Request: 'title' and 'workspaceId' are required." },
        { status: 400 }
      );
    }

    // 3. Authorize: Check if the authenticated user is a member of the workspace
    const workspaceMember = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: { // Correct based on @@unique([workspaceId, userId])
          userId: user.id,
          workspaceId: workspaceId,
        },
      },
    });

    // A user must be a member of the workspace to post, regardless of auth method.
    if (!workspaceMember) {
      return NextResponse.json(
        { error: "Forbidden: You are not a member of this workspace." },
        { status: 403 }
      );
    }

    // If using an API key, check for the 'logbook:create' permission on the key itself
    if (authMethod === "apiKey") {
      if (!authResult?.apiKeyData.permissions.includes("logbook:create")) {
        return NextResponse.json({ error: "Forbidden: This API key does not have 'logbook:create' permission." }, { status: 403 });
      }
    } else {
      // If using a cookie, check for the 'canPost' permission on their workspace membership
      if (!workspaceMember?.canPost) {
        return NextResponse.json({ error: "Forbidden: You do not have permission to post in this workspace." }, { status: 403 });
      }
    }

    // 4. Create the logbook entry
    const newLogbook = await prisma.logbook.create({
      data: {
        title,
        content,
        authorId: user.id,
        workspaceId: workspaceId,
      },
    });

    return NextResponse.json({ success: true, logbook: newLogbook }, { status: 201 });
  } catch (error: any) {
    console.error("Failed to create logbook:", error);

    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Bad Request: Invalid JSON format." }, { status: 400 });
    }

    if (error.message === "Server configuration error.") {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
