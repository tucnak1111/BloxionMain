import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: { groupId: string } }
) {
  const { groupId } = params;

  // Fetch roles from Roblox
  const response = await fetch(
    `https://groups.roblox.com/v1/groups/${groupId}/roles`
  );

  if (!response.ok) {
    return NextResponse.json(
      { error: "Failed to fetch roles from Roblox" },
      { status: 500 }
    );
  }

  const data = await response.json();

  // Roblox format: { roles: [...] }
  return NextResponse.json(data.roles || []);
}