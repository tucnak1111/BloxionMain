"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";
import "../login/login.css";
import "./betaAccess.css";

export default function BetaAccessForm() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/betaAccess", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        const message = data.error || "Invalid beta access code.";
        setError(message);
        toast.error(message);
        return;
      }

      toast.success("Beta access granted.");
      window.location.href = "/login";
    } catch {
      const message = "Could not validate beta access code. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="login-form beta-access-form" onSubmit={handleSubmit}>
      <div className="beta-access-header">
        <div className="beta-access-icon" aria-hidden>
          ✦
        </div>
        <p className="beta-access-badge">Private Beta</p>
      </div>

      <h1>Enter your access code</h1>
      <p className="beta-access-subtitle">
        Bloxion is currently invite-only. Enter your code to continue to Roblox login.
      </p>

      <label htmlFor="beta-code" className="beta-access-label">
        Beta code
      </label>
      <input
        id="beta-code"
        className="beta-code-input"
        type="text"
        value={code}
        onChange={(event) => setCode(event.target.value)}
        placeholder="e.g. BLOXION-BETA-2026"
        autoComplete="off"
        required
      />

      {error ? <p className="beta-code-error">{error}</p> : null}

      <button className="lf--submit beta-access-submit" disabled={loading}>
        {loading ? <span className="spinner" /> : "Unlock Login"}
      </button>

      <p className="beta-access-help">Need access? Contact the Bloxion team for an invite code.</p>
    </form>
  );
}
