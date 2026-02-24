import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { prisma } from "../../../../prisma/Client";

interface JwtPayload extends jwt.JwtPayload {
  id: string;
}

export async function GET(req: Request) {
  const token = (await cookies()).get("bloxion_auth")?.value;
  if (!token) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    const userId = decoded.id;

    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get("workspaceId");

    if (!workspaceId) {
      return NextResponse.json(
        { success: false, error: "Missing workspaceId" },
        { status: 400 }
      );
    }

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: {
        id: true,
        ownerId: true,
        members: {
          where: { userId },
          select: { id: true },
          take: 1,
        },
      },
    });

    if (!workspace) {
      return NextResponse.json(
        { success: false, error: "Workspace not found" },
        { status: 404 }
      );
    }

    const hasAccess = workspace.ownerId === userId || workspace.members.length > 0;
    if (!hasAccess) {
      return NextResponse.json(
        { success: false, error: "Forbidden: no access to this workspace" },
        { status: 403 }
      );
    }

    const members = await prisma.workspaceMember.findMany({
      where: { workspaceId },
      select: {
        id: true,
        rank: true,
        rankName: true,
        user: {
          select: {
            username: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: [{ rank: "desc" }, { user: { username: "asc" } }],
    });

    const formattedMembers = members.map((member) => ({
      id: member.id,
      username: member.user.username,
      avatarUrl: member.user.avatarUrl,
      rankId: member.rank,
      rankName: member.rankName ?? `Rank ${member.rank}`,
    }));

    return NextResponse.json({ success: true, members: formattedMembers });
  } catch (err: any) {
    if (err instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ success: false, error: "Invalid token" }, { status: 403 });
    }

    console.error("Failed to fetch workspace members:", err.message);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
