import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "../../../../prisma/Client";
import axios from "axios";
import { requireActiveUserFromToken } from "../../_utils/auth";

interface RobloxGroup {
  group: {
    id: number;
  };
  role: {
    rank: number;
  };
}

function hasRankAccess(allowedRanks: number[], userRank: number): boolean {
  if (!allowedRanks.length) return false;
  if (allowedRanks.length === 1) return userRank >= allowedRanks[0];
  return allowedRanks.includes(userRank);
}

export async function GET(req: Request) {
  const token = (await cookies()).get("bloxion_auth")?.value;
  const auth = await requireActiveUserFromToken(token);
  if (!auth.user) return auth.response;

  try {
    // 1. Authenticate the user and get their Bloxion and Roblox IDs
    const user = auth.user;

    // 2. Get workspaceId from the request URL
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get("workspaceId");

    if (!workspaceId) {
      return NextResponse.json(
        { error: "Bad Request: Missing 'workspaceId' parameter" },
        { status: 400 }
      );
    }

    // 3. Fetch the workspace details
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { id: true, groupId: true, allowedRanks: true, groupName: true },
    });

    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    // 4. Check the user's current group membership and rank via Roblox API
    const { data: groupData } = await axios.get(
      `https://groups.roblox.com/v2/users/${user.robloxId}/groups/roles`
    );

    const userGroups: RobloxGroup[] = groupData?.data ?? [];
    const groupMatch = userGroups.find((g) => g.group.id.toString() === workspace.groupId);

    if (!groupMatch) {
      return NextResponse.json(
        { error: "Forbidden: You are not a member of the required Roblox group." },
        { status: 403 }
      );
    }

    // 5. Verify if the user's rank is high enough
    const userRank = groupMatch.role.rank;
    if (!hasRankAccess(workspace.allowedRanks, userRank)) {
      return NextResponse.json(
        { error: "Forbidden: Your rank in the group does not grant you access." },
        { status: 403 }
      );
    }

    // If all checks pass, return the workspace data
    return NextResponse.json({ success: true, workspace });
  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      console.error("Roblox API request failed during workspace fetch:", err.response?.data || err.message);
      return NextResponse.json(
        { error: "Failed to verify group membership with Roblox." },
        { status: 502 }
      );
    }
    console.error("Workspace fetch error: ", err.message);
    return NextResponse.json(
      { error: "An internal server error occurred." },
      { status: 500 }
    );
  }
}
