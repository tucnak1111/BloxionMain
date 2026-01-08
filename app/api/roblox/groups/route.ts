import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { prisma } from "../../../../prisma/Client";

interface JwtPayload extends jwt.JwtPayload {
  id: string;
}

// Fetches groups a user is in from Roblox API
export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("bloxion_auth")?.value;
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
    const robloxData = await robloxGroupsResponse.json();

    // Fetch group icons
    if (!robloxData.data || robloxData.data.length === 0) {
      return NextResponse.json([]); // No groups, return empty array
    }

    const groupIds = robloxData.data.map((g: any) => g.group.id);
    const thumbnailsResponse = await fetch(
      `https://thumbnails.roblox.com/v1/groups/icons?groupIds=${groupIds.join(",")}&size=150x150&format=Png&isCircular=false`
    );
    const thumbnailJson = await thumbnailsResponse.json();
    const thumbnailsData = thumbnailJson.data; // Correctly access the 'data' property

    // Combine group data with icons
    const groups = robloxData.data.map((g: any) => {
  const thumbnail = thumbnailsData?.find(
    (t: any) => t.targetId === g.group.id
  );

  return {
    id: g.group.id,
    name: g.group.name,
    iconUrl: thumbnail ? thumbnail.imageUrl : null,

    // NEW 👇
    memberCount: g.group.memberCount,
    ownerName: g.group.owner?.username ?? null,
    roleName: g.role.name,
    roleRank: g.role.rank,
  };
});

    return NextResponse.json(groups);
  } catch (error) {
    console.error("Error in /api/roblox/groups:", error); // Added for better server-side logging
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
