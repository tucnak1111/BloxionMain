import type { Metadata } from "next";
import Navbar from "../components/navbar.tsx";
import "./not-allowed/style.css"; // Using existing global styles

export const metadata: Metadata = {
  title: "Bloxion",
  description: "Your workspace for everything.",
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