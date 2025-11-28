 to"use client";

import { useState } from "react";
import Navbar from "../components/navbar"; // Assuming navbar is now a separate component
import Sidebar from "../components/Sidebar";

type User = {
  username: string | null;
  avatarUrl: string | null;
} | null;

  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
      {/* @ts-expect-error Server Component */}
      <Navbar toggleSidebar={toggleSidebar} user={user} />
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} user={user} />
      <main>{children}</main>
    </>
  );
}