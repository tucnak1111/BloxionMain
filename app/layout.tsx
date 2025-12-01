import type { Metadata } from "next";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { prisma } from "../prisma/Client";
import "./not-allowed/style.css"; // Global styles for body and background
import "../components/sidebar.css";
import "../components/Navbar.css";
import LayoutWrapper from "./LayoutWrapper";
import GlobalNotice from "../components/GlobalNotice";
interface JwtPayload extends jwt.JwtPayload {
  id: string;
}

async function getCurrentUser() {
  const token = cookies().get("bloxion_auth")?.value;
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    return await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { username: true, avatarUrl: true, displayName: true },
    });
  } catch (error) {
    return null;
  }
}

export const metadata: Metadata = {
  title: "Bloxion",
  description: "Your workspace for everything.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <html lang="en">
      <body>
      <script src="https://uptime.betterstack.com/widgets/announcement.js" data-id="231533" async="async" type="text/javascript"></script>
       <GlobalNotice />
        <LayoutWrapper user={user}>{children}</LayoutWrapper>
      </body>
    </html>
  );
}