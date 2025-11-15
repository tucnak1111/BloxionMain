"use client";

import React from "react";
import "./login.css"; // <-- import the CSS (shown below)

export default function LoginPage() {
  const handleLogin = () => {
    // Redirect to your API login route
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
      <input className="lf--submit" type="submit" value="Log In with Roblox" />
    </form>
  );
}