import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Bloxion",
  description: "Moderation tools for Roblox communities",
};


export default function AppLayout({ children }) {
  const token = cookies().get("bloxion_auth")?.value;
  if (!token) redirect("/login");

  try {
    jwt.verify(token, process.env.JWT_SECRET!);
  } catch {
    redirect("/login");
  }

  return <>{children}</>;
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#0b0b0b", color: "white" }}>
        {children}
      </body>
    </html>
  );
}