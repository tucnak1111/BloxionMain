import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { prisma } from "../../../prisma/Client";

interface JwtPayload extends jwt.JwtPayload {
  id: string;
}

// Fetches groups a user is in from Roblox API
export async function GET() {
  const token = (await cookies()).get("bloxion_auth")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { robloxId: true },
    });

    if (!user || !user.robloxId) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch groups from Roblox API
    const robloxGroupsResponse = await fetch(
      `https://groups.roblox.com/v1/users/${user.robloxId}/groups/roles`
    );
    if (!robloxGroupsResponse.ok) {
      throw new Error("Failed to fetch groups from Roblox");
    }
    const { data: groupsData } = await robloxGroupsResponse.json();

    // Fetch group icons for all groups found
    const groupIds = groupsData.map((groupInfo: any) => groupInfo.group.id);
    const thumbnailsResponse = await fetch(
      `https://thumbnails.roblox.com/v1/groups/icons?groupIds=${groupIds.join(",")}&size=150x150&format=Png&isCircular=false`
    );
    const { data: thumbnailsData } = await thumbnailsResponse.json();

    // Combine group data with icons
    const groups = groupsData.map((g: any) => {
      const thumbnail = thumbnailsData.find((thumb: any) => thumb.targetId === g.group.id);
      return {
        id: g.group.id,
        name: g.group.name,
        iconUrl: thumbnail?.imageUrl || null,
      };
    });

    return NextResponse.json(groups);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}