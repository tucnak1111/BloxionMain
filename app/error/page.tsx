"use client";

import React, { useState } from "react";
import "./error.css";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setLoading(true);
    window.location.href = "/../login";
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
      <h1>Authentication error</h1>
      <p> Something went wrong during authentication. Please try again and contact support if the issue is repeated. </p>
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
