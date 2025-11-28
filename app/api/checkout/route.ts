import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { prisma } from "../../../prisma/Client";

interface JwtPayload extends jwt.JwtPayload {
  id: string;
}

export async function POST(request: Request) {
  const token = cookies().get("bloxion_auth")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    const body = await request.json();
    const { groupId, groupName, trackedRoleIds } = body;

    if (!groupId || !groupName || !trackedRoleIds) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const workspace = await prisma.workspace.create({
      data: {
        ownerId: decoded.id,
        groupId: groupId,
        groupName: groupName,
        trackedRoleIds: trackedRoleIds,
        allowedRanks: trackedRoleIds,
      },
    });

    return NextResponse.json(workspace);
  } catch (error) {
    console.error("Workspace creation failed:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}