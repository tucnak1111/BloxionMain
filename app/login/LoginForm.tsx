"use client";

import React, { useState } from "react";
import "./login.css";

export default function LoginForm() {
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setLoading(true);
    window.location.href = "/api/auth/redirect";
  };

  return (
    <form
      className="login-form"
      onSubmit={(e) => {
        e.preventDefault();
        handleLogin();
      }}
    >
      <p className="login-badge">Bloxion</p>
      <h1>Welcome to Bloxion</h1>
      <p className="login-subtitle">Premium tools for high-performance Roblox community operations.</p>

      <button className="lf--submit" disabled={loading}>
        {loading ? (
          <span className="spinner" />
        ) : (
          <>
            <img src="/Roblox_Logo.svg" alt="Roblox Logo" className="roblox-icon" />
            <span>Continue with Roblox</span>
          </>
        )}
      </button>

      <div className="legal-links">
        <a href="https://docs.bloxionapp.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">
          Privacy Policy
        </a>
        <span aria-hidden>&bull;</span>
        <a href="https://docs.bloxionapp.com/legal/terms-of-service" target="_blank" rel="noopener noreferrer">
          Terms of Service
        </a>
      </div>

      <div className="login-footer" aria-hidden={false}>
        <p>&copy; {new Date().getFullYear()} Bloxion. All Rights Reserved.</p>
      </div>
    </form>
  );
}
