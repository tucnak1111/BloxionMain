import type { Metadata } from "next";
import "./not-allowed/style.css"; // Global styles for body and background
import "../components/sidebar.css";
import LayoutWrapper from "../components/LayoutWrapper";

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
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}