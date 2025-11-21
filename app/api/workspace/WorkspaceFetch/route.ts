import { NextResponse } from "next/server";
import { prisma } from "../../../../prisma/Client";
import axios from "axios";
export aasync function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const workspaceId = searchParams.get("workspaceId");

    if (!userId || !workspaceId) {
      return NextResponse.json(
        {
          errror: "missing userId or workspaceId"
        },
        {
          status: 400
        }
      );
    }

    const workspace = await prisma.workspace.findUnique({
      where: {
        id: workspaceId
      },
    });

    if (!workspace) {
      return NextResponse.json(
        {
          error: "Workspace not found"
        },
        {
          status: 404
        }
      );
    }

    const groupRolesRes = await axios.get(
      `https://groups.roblox.com/v2/users/${userId}/groups/roles`
    );

    const userGroups = groupRolesRes.data.data;

    const groupMatch = userGroups.find(
      (g: any) => g.group.id.toString() === workspace.groupId
    );

    if (!groupMatch) {
      return NextResponse.json(
        {
          error: "User not in this group"
        },
        {
          status: 403
        }
      );
    }
    
    const userRank = groupMatch.role.rank;
    const allowedRanks = workspace.allowedRanks as number[];

    if (!allowedRanks.includes(userRank)) {
      return NextResponse.json(
        {
          error: "Insufficient permissions"
        },
        {
          status: 403
        }
      );
    }

    return NextResponse.json(
      {
        success: true, workspace
      },
      {
        status: 200
      }
    );
  } catch (err: any) {
    console.error("Workspace access error: ", err.message);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        detail: err.message,
      },
      {
        status: 500
      }
    );
  }
}


