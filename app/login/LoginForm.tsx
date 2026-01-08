"use client";

import React, { useState } from "react";
import "./login.css";
import { version } from "../../package.json";

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
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap"
        rel="stylesheet"
      />
      <h1>Welcome to Bloxion</h1>

      <button className="lf--submit" disabled={loading}>
        {loading ? <span className="spinner" /> : "Log In with Roblox"}
      </button>

      <div style={{ marginTop: '2em', fontSize: '0.75em', color: '#9ca3af' }}>
        <a href="https://docs.bloxion.xyz/legal/privacy" target="_blank" rel="noopener noreferrer" style={{ color: '#9ca3af', textDecoration: 'none' }}>Privacy Policy</a>
        <span style={{ margin: '0 0.5em' }}>&bull;</span>
        <a href="https://docs.bloxion.xyz/legal/terms" target="_blank" rel="noopener noreferrer" style={{ color: '#9ca3af', textDecoration: 'none' }}>Terms of Service</a>
      </div>

      <div className="login-footer" aria-hidden={false}>
        <p>&copy; {new Date().getFullYear()} Bloxion. All Rights Reserved.</p>
      </div>
    </form>
  );
}
