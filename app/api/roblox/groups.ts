import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import axios from "axios";
import { prisma } from "../../../prisma/Client";

interface JwtPayload extends jwt.JwtPayload {
  id: string;
}

export async function GET() {
  const cookieStore = cookies();
  const token = cookieStore.get("bloxion_auth")?.value;

  if (!token) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error("JWT_SECRET is not defined in environment variables.");
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  }

  try {
    // 1. Authenticate user from session cookie
    const decoded = jwt.verify(token, secret) as JwtPayload;

    // 2. Fetch user from database to get their Roblox ID
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { robloxId: true },
    });

    if (!user || !user.robloxId) {
      return NextResponse.json({ error: "User not found or Roblox ID is missing" }, { status: 404 });
    }

    // 3. Fetch groups from the Roblox API
    const robloxGroupsUrl = `https://groups.roblox.com/v1/users/${user.robloxId}/groups/roles`;
    const { data } = await axios.get(robloxGroupsUrl);

    if (!data || !data.data) {
      return NextResponse.json({ success: true, groups: [] });
    }

    // 4. Return the list of groups
    return NextResponse.json({ success: true, groups: data.data });

  } catch (error: any) {
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: "Invalid or expired session" }, { status: 403 });
    }

    if (axios.isAxiosError(error)) {
      console.error("Roblox API request failed:", error.response?.data || error.message);
      return NextResponse.json(
        { error: "Failed to fetch groups from Roblox." },
        { status: error.response?.status || 502 } // 502 Bad Gateway
      );
    }

    console.error("An unexpected error occurred:", error);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
