import "./privacy.css";

export default function PrivacyPolicyPage() {
  return (
    <div className="privacy-wrapper">
      <div className="privacy-card">
        <h1>Privacy Policy</h1>

        <p className="last-updated">Last updated: [DATE]</p>

        <p>
          This Privacy Policy describes how [YOUR APP NAME] ("we", "our", or "us")
          handles your data when you use our services.
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
        <p>We do not sell your personal data. We may share limited information only:</p>
        <ul>
          <li>[If required by law or legal process]</li>
          <li>[With services necessary to operate the platform]</li>
        </ul>

        <h2>Your Rights</h2>
        <ul>
          <li>[Request access or deletion of your data]</li>
          <li>[Withdraw permissions]</li>
        </ul>

        <h2>Contact Us</h2>
        <p>
          If you have any questions, please contact us at:
          <br />
          <strong>[YOUR CONTACT EMAIL]</strong>
        </p>
      </div>
    </div>
  );
}