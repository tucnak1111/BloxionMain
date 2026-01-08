import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";
import { prisma } from "../../prisma/Client";
import "./login.css";
import LoginForm from "./LoginForm";

interface JwtPayload extends jwt.JwtPayload {
  id: string;
}

/**
 * Fetches the current user's status to check for active session and suspension.
 */
async function getCurrentUser() {
  const token = (await cookies()).get("bloxion_auth")?.value;
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { isSuspended: true },
    });
    return user;
  } catch (error) {
    return null;
  }
}

export default async function LoginPage() {
  const user = await getCurrentUser();

  if (user) {
    if (user.isSuspended) {
      redirect("/not-allowed");
    }
    redirect("/workspaces");
  }

  return <div className="login-page"><LoginForm /></div>;
}
