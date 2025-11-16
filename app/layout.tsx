export const metadata = {
  title: "Bloxion",
  description: "Moderation tools for Roblox communities",
};

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