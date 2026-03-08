import { NextResponse } from "next/server";
import { requireActiveUser } from "../_utils/auth";

// Fetches groups a user is in from Roblox API
export async function GET() {
  const auth = await requireActiveUser();
  if (auth.response) return auth.response;

  try {
    const user = auth.user;

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
