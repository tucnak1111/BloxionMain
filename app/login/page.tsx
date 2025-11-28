import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";
import { prisma } from "../../prisma/Client";
import "./login.css";

interface JwtPayload extends jwt.JwtPayload {
  id: string;
}

/**
 * Fetches the current user's status to check for active session and suspension.
 */
async function getCurrentUser() {
  const token = cookies().get("bloxion_auth")?.value;
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

  return (
    <div className="login-form">
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap"
        rel="stylesheet"
      />
      <h1>Welcome to Bloxion</h1>

      <a href="/api/auth/redirect" className="lf--submit" style={{ textDecoration: 'none' }}>Log In with Roblox</a>

      <div style={{ marginTop: '2em', fontSize: '0.75em', color: '#9ca3af' }}>
        <a href="https://docs.bloxion.xyz/legal/privacy" target="_blank" rel="noopener noreferrer" style={{ color: '#9ca3af', textDecoration: 'none' }}>Privacy Policy</a>
        <span style={{ margin: '0 0.5em' }}>&bull;</span>
        <a href="https://docs.bloxion.xyz/legal/terms" target="_blank" rel="noopener noreferrer" style={{ color: '#9ca3af', textDecoration: 'none' }}>Terms of Service</a>
      </div>
    </div>
  );
}
