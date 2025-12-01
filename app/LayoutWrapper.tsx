"use client";

import { useState } from "react";
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

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const openSettings = () => {
    setSettingsOpen(true);
  }

  return (
    <>
      <Navbar toggleSidebar={toggleSidebar} user={user} openSettings={openSettings} />
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} user={user} openSettings={openSettings} />
      <main style={{ paddingTop: "60px" }}>{children}</main>
      <Settings isOpen={isSettingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
}