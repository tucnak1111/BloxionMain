import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";
import { prisma } from "../../prisma/Client";
import { SuspendedCard } from "./SuspendedCard";

interface JwtPayload extends jwt.JwtPayload {
  id: string;
}

/**
 * Fetches the current user's suspension status from the database.
 */
async function getCurrentUser() {
  const token = cookies().get("bloxion_auth")?.value;
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        isSuspended: true,
        suspendedReason: true,
        username: true,
      },
    });
    return user;
  } catch (error) {
    // Invalid token, treat as logged out
    return null;
  }
}

export default async function SuspendedPage() {
  const user = await getCurrentUser();

  // If user is not logged in, redirect to login page
  if (!user) {
    redirect("/login");
  }

  // If user is logged in but NOT suspended, redirect to dashboard
  if (!user.isSuspended) {
    redirect("/dashboard");
  }

  return <SuspendedCard reason={user.suspendedReason} />;
}

