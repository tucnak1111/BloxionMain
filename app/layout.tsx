import type { Metadata } from "next";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { prisma } from "../prisma/Client";
import "./not-allowed/style.css"; // Global styles for body and background

interface JwtPayload extends jwt.JwtPayload {
  id: string;
}

/**
 * Fetches the current user's data for the navbar.
 */
async function getCurrentUser() {
  const token = cookies().get("bloxion_auth")?.value;
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        username: true,
        avatarUrl: true,
      },
    });
    return user;
  } catch (error) {
    // Invalid token, treat as logged out
    return null;
  }
}

async function Navbar() {
  const user = await getCurrentUser();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <a href="/workspaces" className="navbar-brand">
          Bloxion
        </a>

        <div className="navbar-user">
          {user ? (
            <>
              <div className="user-info">
                {user.avatarUrl && <img src={user.avatarUrl} alt="User Avatar" />}
                <span>{user.username}</span>
              </div>
              <a href="/api/auth/logout" className="navbar-logout">
                Logout
              </a>
            </>
          ) : (
            <a href="/login" className="lf--submit" style={{ textDecoration: 'none' }}>
              Login
            </a>
          )}
        </div>
      </div>
    </nav>
  );
}

export const metadata: Metadata = {
  title: "Bloxion",
  description: "Your workspace for everything.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}