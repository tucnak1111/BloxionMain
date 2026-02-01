import { NextResponse } from "next/server";
import { prisma } from "../../../../prisma/Client";

export async function POST(req: Request) {
  
  const auth = req.headers.get("x-api-key");


  if (auth == null) {
    return NextResponse.json(
      { error: "Unauthorized; no key" },
      { status: 401 }
    );
  }

  
  let token = auth;
  if (auth.startsWith("Bearer ")) {
    token = auth.slice("Bearer ".length);
  }

  
  if (token !== process.env.INTERNAL_BAN_API_KEY) {
    return NextResponse.json(
      { error: "Unauthorized; wrong key" },
      { status: 401 }
    );
  }

  
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const { robloxId, reason, bannedBy } = body;

  
  if (!robloxId || !reason) {
    return NextResponse.json(
      { error: "Missing robloxId or reason" },
      { status: 400 }
    );
  }

  try {
    
    const userToBan = await prisma.user.findUnique({
      where: { robloxId },
    });

    
    if (!userToBan) {
      return NextResponse.json({ error: `User with robloxId '${robloxId}' not found.` }, { status: 404 });
    }

    
    await prisma.$transaction([
      
      prisma.user.update({
        where: { id: userToBan.id },
        data: {
          isSuspended: true,
          suspendedReason: reason,
          suspendedAt: new Date(),
        },
      }),
      
      prisma.banLog.create({
        data: {
          userId: userToBan.id, 
          reason,
          bannedBy: bannedBy || "bot",
        },
      }),
    ]);

    
    return NextResponse.json({ success: true, message: `User ${userToBan.username} has been banned.` });
  } catch (error: any) {
    console.error("Failed to process ban:", error);
    return NextResponse.json({ error: "An internal database error occurred." }, { status: 500 });
  }
}
