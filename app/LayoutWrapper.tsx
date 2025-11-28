"use client";

import { useState } from "react";
import Navbar from "../components/navbar"; // Assuming navbar is now a separate component
import Sidebar from "../components/Sidebar";

type User = {
  username: string | null;
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

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
      <Navbar toggleSidebar={toggleSidebar} user={user} />
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} user={user} />
      <main>{children}</main>
    </>
  );
}