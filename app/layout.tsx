import { Toaster } from "react-hot-toast";
import "./globals.css";
import { version } from "../package.json";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { prisma } from "../prisma/Client";
import LayoutWrapper from "./LayoutWrapper";

interface JwtPayload extends jwt.JwtPayload {
  id: string;
}

async function getCurrentUser() {
  const token = (await cookies()).get("bloxion_auth")?.value;
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        username: true,
        displayName: true,
        avatarUrl: true,
      },
    });
    return user;
  } catch (error) {
    return null;
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <html lang="en">
      <body className="app-container">
        <LayoutWrapper user={user}>
          {/* Toaster for notifications across all pages */}
          <Toaster
            position="top-center"
            reverseOrder={false}
            toastOptions={{
              duration: 5000,
              style: {
                background: "#1e293b",
                color: "#fff",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                boxShadow: "0 8px 20px rgba(0, 0, 0, 0.3)",
              },
            }}
          />
          {children}
        </LayoutWrapper>

        {/* Version badge (fixed, bottom-right) - not a footer */}
        <div className="app-version">Version {version}</div>
      </body>
    </html>
  );
}