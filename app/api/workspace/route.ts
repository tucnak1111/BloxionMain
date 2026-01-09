import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { prisma } from "../../../prisma/Client";

interface JwtPayload extends jwt.JwtPayload {
  id: string;
}

export async function GET(req: Request) {
  const token = (await cookies()).get("bloxion_auth")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized: Not logged in" }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    const userId = decoded.id;

    // Fetch workspaces where the user is the owner
    const ownedWorkspaces = await prisma.workspace.findMany({
      where: {
        ownerId: userId,
      },
      select: {
        id: true,
        groupId: true,
        groupName: true,
      },
    });

    // Fetch workspaces where the user is a member
    const memberWorkspaces = await prisma.workspaceMember.findMany({
      where: {
        userId: userId,
      },
      select: {
        workspace: {
          select: {
            id: true,
            groupId: true,
            groupName: true,
          },
        },
      },
    });

    // Extract workspace details from memberWorkspaces
    const memberWorkspaceDetails = memberWorkspaces.map(
      (membership) => membership.workspace
    );

    // Combine and remove duplicates (a user might own and be a member, though ownerId should cover it)
    const allWorkspacesMap = new Map();
    ownedWorkspaces.forEach((ws) => allWorkspacesMap.set(ws.id, ws));
    memberWorkspaceDetails.forEach((ws) => allWorkspacesMap.set(ws.id, ws));

    const allWorkspaces = Array.from(allWorkspacesMap.values());

    return NextResponse.json(allWorkspaces);
  } catch (err: any) {
    if (err instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: "Invalid or expired session" }, { status: 403 });
    }
    console.error("Error fetching all workspaces:", err.message);
    return NextResponse.json(
      { error: "An internal server error occurred." },
      { status: 500 }
    );
  }
}
