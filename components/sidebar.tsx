"use client";

import "./sidebar.css";

type User = {
  username: string | null;
  avatarUrl: string | null;
} | null;

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  user: User;
}

export default function Sidebar({ isOpen, toggleSidebar, user }: SidebarProps) {
  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? "open" : ""}`} onClick={toggleSidebar}></div>
      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h3>Navigation</h3>
          <button onClick={toggleSidebar} className="sidebar-close-btn">&times;</button>
        </div>
        <nav className="sidebar-nav">
          {user && (
            <>
              <a href="/workspaces">Workspaces</a>
              <a href="/settings">Settings</a>
              <a href="/profile">Profile</a>
              <a href="/billing">Billing</a>
            </>
          )}
        </nav>

        {user && (
          <div className="sidebar-footer">
            <div className="user-info">
              {user.avatarUrl && <img src={user.avatarUrl} alt="User Avatar" />}
              <span>{user.username}</span>
            </div>
            <a href="/api/auth/logout" className="navbar-logout">Logout</a>
          </div>
        )}
      </aside>
    </>
  );
}