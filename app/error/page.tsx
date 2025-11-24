"use client";

import React, { useState } from "react";
import "./login.css";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setLoading(true);
    window.location.href = "/../api/auth/redirect";
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
      <h1>An error has occurred</h1>
      <p> An error has occured while authenticating. Please try again and if the issue presists, contact support.
      <button className="lf--submit" disabled={loading}>
        {loading ? (
          <span className="spinner" />
        ) : (
          "Retry"
        )}
      </button>
    </form>
  );
}
