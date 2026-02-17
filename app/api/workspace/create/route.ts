import { prisma } from "../../../../prisma/Client";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

interface JwtPayload extends jwt.JwtPayload {
  id: string;
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get("bloxion_auth")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    const userId = decoded.id;

    // Fetch the user to get their robloxId
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { robloxId: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { name, description, community, minRank } = await req.json();

    const hasRequiredFields =
      typeof name === "string" &&
      typeof description === "string" &&
      community &&
      typeof community === "object" &&
      (typeof community.id === "string" || typeof community.id === "number") &&
      typeof community.name === "string" &&
      minRank &&
      typeof minRank === "object" &&
      typeof minRank.rank === "number";

    if (!hasRequiredFields) {
      return NextResponse.json(
        { error: "Invalid or missing required fields" },
        { status: 400 }
      );
    }

    if (!Number.isInteger(minRank.rank) || minRank.rank < 0 || minRank.rank > 255) {
      return NextResponse.json(
        { error: "Invalid minRank.rank value" },
        { status: 400 }
      );
    }

    const workspace = await prisma.workspace.create({
      data: {
        ownerId: userId,
        groupName: community.name,
        groupId: String(community.id),
        allowedRanks: [minRank.rank],
        members: {
          create: {
            userId: userId,
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
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
