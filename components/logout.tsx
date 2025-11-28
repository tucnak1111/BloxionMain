
"use client";

import React from "react";

export default function LogoutButton() {
  const handleLogout = () => {
    // Redirect to the logout API route
    window.location.href = "/api/auth/logout";
  };

  return (
    <button onClick={handleLogout} style={{ /* Add your button styles here */ }}>
      Log Out
    </button>
  );
}