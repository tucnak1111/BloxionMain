import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { prisma } from "../../../../prisma/Client";
import axios from "axios";

interface JwtPayload extends jwt.JwtPayload {
  id: string;
}

interface RobloxGroup {
  group: {
    id: number;
  };
  role: {
    rank: number;
  };
}

export async function GET(req: Request) {
  const token = (await cookies()).get("bloxion_auth")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized: Not logged in" }, { status: 401 });
  }

  try {
    // 1. Authenticate the user and get their Bloxion and Roblox IDs
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, robloxId: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

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
    if (!workspace.allowedRanks.includes(userRank)) {
      return NextResponse.json(
        { error: "Forbidden: Your rank in the group does not grant you access." },
        { status: 403 }
      );
    }

    // If all checks pass, return the workspace data
    return NextResponse.json({ success: true, workspace });
  } catch (err: any) {
    if (err instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: "Invalid or expired session" }, { status: 403 });
    }
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
