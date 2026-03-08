import { prisma } from "../../../../prisma/Client";
import { NextRequest, NextResponse } from "next/server";
<<<<<<< HEAD
import { requireActiveUser } from "../../_utils/auth";

export async function POST(req: NextRequest) {
  const auth = await requireActiveUser();
  if (auth.response) return auth.response;

  try {
    const user = auth.user;
=======
import { requireActiveUserFromToken } from "../../_utils/auth";
import { shouldBrewTeapot, teapotResponse } from "../../_utils/teapot";

export async function POST(req: NextRequest) {
  const token = req.cookies.get("bloxion_auth")?.value;
  const auth = await requireActiveUserFromToken(token);
  if (!auth.user) return auth.response;

  try {
    const userId = auth.user.id;

    // Fetch the user to get their robloxId
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { robloxId: true, id: true }, 
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
>>>>>>> 5a31552bd822e8986360676ef2caac43cf2492c1

    const { name, description, community, minRank } = await req.json();

    if (!name || !description || !community || !minRank) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (shouldBrewTeapot([name, description, community?.name?.toString(), community?.id?.toString()])) {
      return teapotResponse("Cannot create a workspace from an absurd request.");
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
