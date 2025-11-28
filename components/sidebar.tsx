"use client";

import "./sidebar.css";

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

export default function Sidebar({ isOpen, toggleSidebar }: SidebarProps) {
  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? "open" : ""}`} onClick={toggleSidebar}></div>
      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h3>Navigation</h3>
          <button onClick={toggleSidebar} className="sidebar-close-btn">&times;</button>
        </div>
        <nav className="sidebar-nav">
          <a href="/workspaces">Workspaces</a>
          <a href="/settings">Settings</a>
          <a href="/profile">Profile</a>
          <a href="/billing">Billing</a>
        </nav>
      </aside>
    </>
  );
}