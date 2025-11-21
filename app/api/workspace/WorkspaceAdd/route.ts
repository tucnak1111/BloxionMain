import { NextResponse } from "next/server";
import { prisma } from "../../../../prisma/Client"; 
import { z } from "zod";

const WorkspaceSchema = z.object({
  userId: z.string(),
  groupId: z.string(),
  groupName: z.string(),
  allowedRanks: z.array(z.number()),
});

export async function handler(req: Request) {
  try {
    const body = await req.json();
    const data = WorkspaceSchema.parse(body);

    const { userId, groupId, groupName, allowedRanks } = data;

    const workspace = await prisma.workspace.create({
      data: {
        ownerId: userId,
        groupId,
        groupName,
        allowedRanks,
      },
    });
    return NextResponse.json({ success: true, workspace }, {status: 201});
  } catch (err: any) {
    console.error("Error: ", err);

    return NextResponse.json(
      {
        success: false,
        error: err.message || "Invalid request",
      },
      {
        status: 400
      }
    );
  }
}
