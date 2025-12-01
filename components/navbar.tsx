"use client";

import { useState, useEffect, useRef } from "react";
import "./Navbar.css";

type User = {
  username: string | null;
  displayName: string | null;
  avatarUrl: string | null;
} | null;

interface NavbarProps {
  toggleSidebar?: () => void;
  openSettings: () => void;
  user: User;
}

export default function Navbar({ toggleSidebar, openSettings, user }: NavbarProps) {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  const handleSettingsClick = () => {
    openSettings();
    setDropdownOpen(false); // Close dropdown after opening settings
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-left">
          {toggleSidebar && (
            <button onClick={toggleSidebar} className="sidebar-toggle-btn">
              &#9776;
            </button>
          )}
          <a href="/workspaces" className="navbar-brand">
            Bloxion
          </a>
        </div>

        <div className="navbar-user" ref={dropdownRef}>
          {user ? (
            <>
              <div className="user-info" onClick={() => setDropdownOpen(!isDropdownOpen)}>
                {user.avatarUrl && <img src={user.avatarUrl} alt="User Avatar" />}
                <span>
                  {user.displayName || user.username} (@{user.username})
                </span>
              </div>

              {isDropdownOpen && (
                <div className="user-dropdown">
                  <button onClick={handleSettingsClick}>Settings</button>
                  <a href="/api/auth/logout" style={{textDecoration: 'none'}}><button style={{width: '100%'}}>Logout</button></a>
                </div>
              )}
            </>
          ) : (
            <a href="/api/auth/redirect" className="lf--submit" style={{ textDecoration: 'none' }}>
              Login
            </a>
          )}
        </div>
      </div>
    </nav>
  );
}