import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "../../../../prisma/Client";
import { requireActiveUserFromToken } from "../../_utils/auth";
import { shouldBrewTeapot, teapotResponse } from "../../_utils/teapot";

export async function GET(req: Request) {
  const token = (await cookies()).get("bloxion_auth")?.value;
  const auth = await requireActiveUserFromToken(token);
  if (!auth.user) return auth.response;

  try {
    const userId = auth.user.id;

    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get("workspaceId");

    if (!workspaceId) {
      return NextResponse.json(
        { success: false, error: "Missing workspaceId" },
        { status: 400 }
      );
    }

    if (shouldBrewTeapot([workspaceId])) {
      return teapotResponse("Absurd workspaceId provided.");
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
    console.error("Failed to fetch workspace members:", err.message);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
