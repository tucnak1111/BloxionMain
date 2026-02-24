import { prisma } from "../../../../prisma/Client";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { Prisma } from "@prisma/client";

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
      select: { robloxId: true, id: true }, 
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

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
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "A workspace for this group already exists." },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
