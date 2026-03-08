import { prisma } from "../../../../prisma/Client";
import { NextRequest, NextResponse } from "next/server";
import { requireActiveUser } from "../../_utils/auth";

export async function POST(req: NextRequest) {
  const auth = await requireActiveUser();
  if (auth.response) return auth.response;

  try {
    const user = auth.user;

    const { name, description, community, minRank } = await req.json();

    if (!name || !description || !community || !minRank) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const workspace = await prisma.workspace.create({
      data: {
        ownerId: user.id, // Set ownerId to robloxId
        groupName: community.name,
        groupId: community.id.toString(),
        allowedRanks: [minRank.rank],
        members: {
          create: {
            userId: user.id,
            robloxId: user.robloxId, // Set member's robloxId to user's robloxId
            rank: 255, // Owner rank
            rankName: "Owner",
            canPost: true,
            canEdit: true,
            canDelete: true,
          },
        },
      },
    });

    return NextResponse.json(workspace);
  } catch (error) {
    console.error("Workspace creation failed:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
