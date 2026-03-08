import { NextResponse } from "next/server";
import { requireActiveUser } from "../../_utils/auth";

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
  const groups = await Promise.all(
  robloxData.data.map(async (g: any) => {
    // Fetch group roles (THIS is new)
    const rolesRes = await fetch(
      `https://groups.roblox.com/v1/groups/${g.group.id}/roles`
    );

    if (!rolesRes.ok) {
      throw new Error("Failed to fetch group roles");
    }

    const rolesJson = await rolesRes.json();

    // Only roles the user can actually manage
    const roles = rolesJson.roles
      .filter((r: any) => r.rank <= g.role.rank)
      .map((r: any) => ({
        id: r.id,
        name: r.name,
        rank: r.rank,
      }))
      .sort((a: any, b: any) => b.rank - a.rank);

    const thumbnail = thumbnailsData?.find(
      (t: any) => t.targetId === g.group.id
    );

    return {
      id: g.group.id,
      name: g.group.name,
      iconUrl: thumbnail?.imageUrl
        ? thumbnail.imageUrl.replace("http://", "https://")
        : null,

      memberCount: g.group.memberCount,
      ownerName: g.group.owner?.username ?? null,

      // user’s role
      roleName: g.role.name,
      roleRank: g.role.rank,

      // 👇 THIS is what you needed
      roles,
    };
  })
);

    return NextResponse.json(groups);
  } catch (error) {
    console.error("Error in /api/roblox/groups:", error); // Added for better server-side logging
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
