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
        // Include owner's display name
        owner: {
          select: {
            displayName: true,
            username: true, // Fallback if displayName is null
          },
        },
        // Count members
        _count: {
          select: {
            members: true,
          },
        },
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
            // Include owner's display name
            owner: {
              select: {
                displayName: true,
                username: true,
              },
            },
            // Count members
            _count: {
              select: {
                members: true,
              },
            },
          },
        },
      },
    });

    // Process ownedWorkspaces
    const formattedOwnedWorkspaces = ownedWorkspaces.map(ws => ({
      id: ws.id,
      groupId: ws.groupId,
      groupName: ws.groupName,
      memberCount: ws._count.members,
      groupOwner: ws.owner.displayName || ws.owner.username,
    }));

    // Process memberWorkspaces
    const formattedMemberWorkspaces = memberWorkspaces.map(membership => ({
      id: membership.workspace.id,
      groupId: membership.workspace.groupId,
      groupName: membership.workspace.groupName,
      memberCount: membership.workspace._count.members,
      groupOwner: membership.workspace.owner.displayName || membership.workspace.owner.username,
    }));

    // Combine and remove duplicates
    const allWorkspacesMap = new Map();
    formattedOwnedWorkspaces.forEach((ws) => allWorkspacesMap.set(ws.id, ws));
    formattedMemberWorkspaces.forEach((ws) => allWorkspacesMap.set(ws.id, ws));

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