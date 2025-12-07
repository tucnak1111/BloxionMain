import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  context: { params: { groupId: string } }
) {
  const { groupId } = context.params;

  // 1. Input Validation: Ensure groupId is a valid number.
  if (!/^\d+$/.test(groupId)) {
    return NextResponse.json({ error: "Invalid groupId format." }, { status: 400 });
  }

  try {
    // 2. Caching: Fetch roles from Roblox, caching the result for 1 hour.
    const response = await fetch(
      `https://groups.roblox.com/v1/groups/${groupId}/roles`,
      {
        next: {
          revalidate: 3600, // Cache for 1 hour (3600 seconds)
        },
      }
    );

    // 3. Improved Error Handling: Forward the status from the Roblox API.
    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch roles from Roblox API." },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data.roles || []);
  } catch (error) {
    console.error("Error fetching roles:", error);
    return NextResponse.json({ error: "An internal server error occurred." }, { status: 500 });
  }
}