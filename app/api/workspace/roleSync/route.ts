import { NextResponse } from "next/server";
<<<<<<< HEAD
import axios from "axios";
import { prisma } from "../../../../prisma/Client";
import { Workspace, WorkspaceMember } from "@prisma/client";
import { requireActiveUser } from "../../_utils/auth";
=======
import { cookies } from "next/headers";
import axios from "axios";
import { prisma } from "../../../../prisma/Client";
import { requireActiveUserFromToken } from "../../_utils/auth";
>>>>>>> 5a31552bd822e8986360676ef2caac43cf2492c1

interface RobloxGroup {
  group: {
    id: number;
    name: string;
  };
  role: {
    id: number;
    name: string;
    rank: number;
  };
}

function hasRankAccess(allowedRanks: number[], userRank: number): boolean {
  if (!allowedRanks.length) return false;
  if (allowedRanks.length === 1) return userRank >= allowedRanks[0];
  return allowedRanks.includes(userRank);
}

/**
 * Fetches a user's group roles from the Roblox API.
 */
async function getRobloxGroupRoles(robloxId: string): Promise<RobloxGroup[]> {
  const url = `https://groups.roblox.com/v2/users/${robloxId}/groups/roles`;
  const { data } = await axios.get(url);
  return data?.data ?? [];
}

/**
 * Syncs a user's workspace memberships based on their Roblox group roles.
 */
async function syncWorkspacesForUser(
  userId: string,
  robloxId: string,
  userGroups: RobloxGroup[]
): Promise<string[]> {
  const groupIds = userGroups.map((g) => g.group.id.toString());

  // 1. Find all workspaces that match the user's groups and all their existing memberships.
  const [relevantWorkspaces, existingMemberships] = await Promise.all([
    prisma.workspace.findMany({
      where: { groupId: { in: groupIds } },
    }),
    prisma.workspaceMember.findMany({
      where: { userId: userId },
    }),
  ]);

  const updatedWorkspaceNames: string[] = [];
  const transactions = [];

  for (const workspace of relevantWorkspaces) {
    const groupMatch = userGroups.find((g) => g.group.id.toString() === workspace.groupId);
    if (!groupMatch) continue;

    const userRank = groupMatch.role.rank;
    const rankName = groupMatch.role.name;
    const isAllowed = hasRankAccess(workspace.allowedRanks, userRank);

    const existingMembership = existingMemberships.find((m) => m.workspaceId === workspace.id);

    if (isAllowed) {
      // If user is allowed, create or update their membership.
      if (existingMembership) {
        // Update if rank has changed.
        if (existingMembership.rank !== userRank) {
          transactions.push(
            prisma.workspaceMember.update({
              where: { id: existingMembership.id },
              data: { rank: userRank, rankName },
            })
          );
        }
      } else {
        // Create new membership.
        transactions.push(
          prisma.workspaceMember.create({
            data: {
              workspaceId: workspace.id,
              userId: userId,
              robloxId: robloxId,
              rank: userRank,
              rankName,
            },
          })
        );
      }
      updatedWorkspaceNames.push(workspace.groupName ?? workspace.id);
    } else if (existingMembership) {
      // If user is no longer allowed but has a membership, remove it.
      transactions.push(prisma.workspaceMember.delete({ where: { id: existingMembership.id } }));
    }
  }

  // Execute all database operations in a single transaction.
  if (transactions.length > 0) {
    await prisma.$transaction(transactions);
  }

  return updatedWorkspaceNames;
}

export async function POST() {
<<<<<<< HEAD
  const auth = await requireActiveUser();
  if (auth.response) return auth.response;

  try {
=======
  const token = (await cookies()).get("bloxion_auth")?.value;
  const auth = await requireActiveUserFromToken(token);
  if (!auth.user) return auth.response;

  try {
    // 1. Authenticate the user and get their Bloxion and Roblox IDs.
>>>>>>> 5a31552bd822e8986360676ef2caac43cf2492c1
    const user = auth.user;

    // 2. Fetch the user's groups from Roblox.
    const userGroups = await getRobloxGroupRoles(user.robloxId);

    // 3. Process memberships and update the database.
    const updatedWorkspaces = await syncWorkspacesForUser(user.id, user.robloxId, userGroups);

    return NextResponse.json({
      success: true,
      updatedCount: updatedWorkspaces.length,
      updatedWorkspaces: updatedWorkspaces,
    });
  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      console.error("Roblox API request failed during role sync:", err.response?.data || err.message);
      return NextResponse.json({ error: "Failed to fetch roles from Roblox." }, { status: 502 });
    }
    console.error("Role sync failed:", err.message);
    return NextResponse.json({ error: "An internal server error occurred." }, { status: 500 });
  }
}
