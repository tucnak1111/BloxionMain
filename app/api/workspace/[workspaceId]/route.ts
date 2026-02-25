import { NextResponse, NextRequest } from "next/server"; // Ensure NextRequest is imported
import { cookies } from "next/headers";
import { prisma } from "../../../../prisma/Client";
import axios from "axios";
import { requireActiveUserFromToken } from "../../_utils/auth";
import { shouldBrewTeapot, teapotResponse } from "../../_utils/teapot";

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

// Define the context type EXACTLY as the validator expects its incoming value to be
interface Context {
  params: Promise<{
    workspaceId: string; // The validator sees this in the Promise
  }>;
}

export async function GET(req: NextRequest, context: Context) { // Use NextRequest
  const token = (await cookies()).get("bloxion_auth")?.value;
  const auth = await requireActiveUserFromToken(token);
  if (!auth.user) return auth.response;

  try {
    console.log("API: Workspace Fetch - Start");
    const user = auth.user;
    console.log("API: Workspace Fetch - JWT Decoded for userId:", user.id);
    console.log("API: Workspace Fetch - User found:", user.id);

    // Await the params to get the actual object
    const resolvedParams = await context.params;
    const workspaceId = resolvedParams.workspaceId; // Access workspaceId from the resolved object
    console.log("API: Workspace Fetch - Workspace ID from params:", workspaceId);


    if (!workspaceId) {
      console.log("API: Workspace Fetch - Missing workspaceId parameter");
      return NextResponse.json(
        { error: "Bad Request: Missing 'workspaceId' parameter" },
        { status: 400 }
      );
    }

    if (shouldBrewTeapot([workspaceId])) {
      return teapotResponse("This workspaceId is too absurd to process.");
    }

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: {
        id: true,
        groupId: true,
        allowedRanks: true,
        groupName: true,
        // Include owner's display name
        owner: {
          select: {
            displayName: true,
            username: true, // Fallback if displayName is null
          },
        },
        // Count members
        _count: {
          select: {
            members: true,
          },
        },
      },
    });

    if (!workspace) {
      console.log("API: Workspace Fetch - Workspace not found for ID:", workspaceId);
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }
    console.log("API: Workspace Fetch - Workspace data fetched for ID:", workspaceId);

    // Process the workspace data to include memberCount and groupOwner
    const formattedWorkspace = {
      id: workspace.id,
      groupId: workspace.groupId,
      groupName: workspace.groupName,
      allowedRanks: workspace.allowedRanks, // Keep existing fields
      memberCount: workspace._count.members,
      groupOwner: workspace.owner.displayName || workspace.owner.username,
    };
    console.log("API: Workspace Fetch - Formatted workspace data.");


    console.log("API: Workspace Fetch - Calling Roblox API for user:", user.robloxId);
    const { data: groupData } = await axios.get(
      `https://groups.roblox.com/v2/users/${user.robloxId}/groups/roles`
    );
    console.log("API: Workspace Fetch - Roblox API response received.");

    const userGroups: RobloxGroup[] = groupData?.data ?? [];
    const groupMatch = userGroups.find((g) => g.group.id.toString() === formattedWorkspace.groupId);

    if (!groupMatch) {
      console.log("API: Workspace Fetch - User not member of required Roblox group.");
      return NextResponse.json(
        { error: "Forbidden: You are not a member of the required Roblox group." },
        { status: 403 }
      );
    }
    console.log("API: Workspace Fetch - User is member of Roblox group.");

    const userRank = groupMatch.role.rank;
    if (!hasRankAccess(formattedWorkspace.allowedRanks, userRank)) {
      console.log("API: Workspace Fetch - User rank insufficient.");
      return NextResponse.json(
        { error: "Forbidden: Your rank in the group does not grant you access." },
        { status: 403 }
      );
    }
    console.log("API: Workspace Fetch - User rank sufficient.");

    console.log("API: Workspace Fetch - Successful response for workspace:", formattedWorkspace.id);
    return NextResponse.json({ success: true, workspace: formattedWorkspace });
  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      console.error("API: Workspace Fetch - Roblox API request failed:", err.response?.data || err.message);
      return NextResponse.json(
        { error: "Failed to verify group membership with Roblox." },
        { status: 502 }
      );
    }
    console.error("API: Workspace Fetch - An internal server error occurred:", err.message);
    return NextResponse.json(
      { error: "An internal server error occurred." },
      { status: 500 }
    );
  }
}
