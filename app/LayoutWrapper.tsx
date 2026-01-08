"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Navbar from "../components/navbar"; // Assuming navbar is now a separate component
import Sidebar from "../components/sidebar";
import Settings from "../components/Settings";

type User = {
  username: string | null;
  displayName: string | null;
  avatarUrl: string | null;
} | null;

export default function LayoutWrapper({
  children,
  user,
}: {
  children: React.ReactNode;
  user: User;
}) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const pathname = usePathname();

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const openSettings = () => {
    setSettingsOpen(true);
  };

  // Show navbar/sidebar on all pages
  const shouldShowLayout = true;

  if (!shouldShowLayout) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar toggleSidebar={toggleSidebar} user={user} openSettings={openSettings} />
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} user={user} openSettings={openSettings} />
<main className="appContent">{children}</main>
      <Settings isOpen={isSettingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
}