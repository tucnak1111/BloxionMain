import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../prisma/Client"; 
import { z } from "zod";

const WorkspaceSchema = z.object({
  userId: z.string(),
  groupId: z.string(),
  groupName: z.string(),
  allowedRanks: z.array(z.number()),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed, ensure you're using POST" });
  }

  try {
    const body = WorkspaceSchema.parse(req.body);
    const { userId, groupId, groupName, allowedRanks } = body;

    const workspace = await prisma.workspace.create({
      data: {
        ownerId: userId,
        groupId,
        groupName,
        allowedRanks,
      },
    });

    return res.status(201).json({ success: true, workspace });
  } catch (err: any) {
    console.error("Error creating workspace:", err);
    return res
      .status(400)
      .json({ success: false, error: err.message || "Invalid request" });
  }
}
