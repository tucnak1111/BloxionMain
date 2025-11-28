import type { Metadata } from "next";
import Navbar from "../components/Navbar";
import "./not-allowed/style.css"; // Global styles for body and background

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