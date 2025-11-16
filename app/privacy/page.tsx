"use client";

import "./privacy.css";

export default function PrivacyPolicyPage() {
  return (
    <div className="privacy-container">
      <div className="privacy-card">
        <h1>Privacy Policy</h1>
        <p className="updated">Last updated: [DATE]</p>

        <p>
          This Privacy Policy describes how <strong>[YOUR APP NAME]</strong>
          ("we", "our", or "us") handles your data when you use our services.
        </p>

        <h2>Information We Collect</h2>
        <ul>
          <li>[Example: Roblox User ID, Username, Avatar]</li>
          <li>[Example: Workspace / Group Membership Data]</li>
          <li>[Example: Moderation or Ban Records]</li>
          <li>[Add or remove as needed]</li>
        </ul>

        <h2>How We Use Your Information</h2>
        <ul>
          <li>[Authenticating your account]</li>
          <li>[Managing Roblox group permissions]</li>
          <li>[Security, moderation, and fraud prevention]</li>
          <li>[Improving our platform]</li>
        </ul>

        <h2>Data Sharing</h2>
        <ul>
          <li>[If required by law or legal process]</li>
          <li>[With services necessary to operate the platform]</li>
        </ul>

        <h2>Your Rights</h2>
        <ul>
          <li>[Access or update your data]</li>
          <li>[Request deletion of stored information]</li>
          <li>[Withdraw consent where applicable]</li>
        </ul>

        <h2>Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy, you can contact us at: <br/>
          <strong>[YOUR CONTACT EMAIL]</strong>
        </p>

        <div className="button-row">
          <a href="/" className="return-btn">Return to Home</a>
        </div>
      </div>
    </div>
  );
}