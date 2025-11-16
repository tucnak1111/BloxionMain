import Head from "next/head";
import "./terms.css";

export default function TermsPage() {
  return (
    <>
      <Head>
        <title>Terms of Service - Bloxion</title>

        {/* Google Font: Inter */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>

      <div className="terms-container">
        <h1>Terms of Service (ToS) – Bloxion</h1>
        <p className="updated">Last Updated: 30th August 2025</p>

        <p>
          By accessing or using Bloxify (“Service”), you agree to comply with these Terms
          of Service (“Terms”). If you do not agree, you must not use the Service.
        </p>

        <h2>1. Acceptance of Terms</h2>
        <p>
          By creating an account or using the Service, you confirm that you understand
          and agree to these Terms and any future updates. Continued use constitutes
          acceptance of any changes.
        </p>

        <h2>2. Eligibility</h2>
        <ul>
          <li>You must be at least 13 years old to use the Service.</li>
          <li>
            By using the Service, you confirm that you have the legal right to enter
            into these Terms.
          </li>
        </ul>

        <h2>3. Accounts</h2>
        <ul>
          <li>You are responsible for maintaining the confidentiality of your login credentials.</li>
          <li>All activity under your account is your responsibility.</li>
          <li>Sharing or using another person’s account without permission is prohibited.</li>
          <li>You agree to provide accurate account information and keep it up to date.</li>
        </ul>

        <h2>4. User Conduct</h2>
        <p>You agree not to:</p>
        <ul>
          <li>Violate any laws, regulations, or third-party rights.</li>
          <li>Engage in harassment, bullying, hate speech, or threats.</li>
          <li>Spam, scam, or attempt phishing.</li>
          <li>Attempt to disrupt or hack the Service.</li>
          <li>Exploit bugs or vulnerabilities without responsible disclosure.</li>
        </ul>
        <p>
          Failure to follow these rules may result in warnings, temporary suspension,
          or permanent bans.
        </p>

        <h2>5. Content</h2>
        <ul>
          <li>You retain ownership of content you upload or create.</li>
          <li>
            By submitting content, you grant Bloxify a non-exclusive, worldwide,
            royalty-free license to use, display, and distribute it for Service operation.
          </li>
          <li>You are solely responsible for your submitted content.</li>
        </ul>

        <h2>6. Service Availability</h2>
        <ul>
          <li>The Service is provided “as is” with no guarantees of uptime or performance.</li>
          <li>
            We are not responsible for loss of data, revenue, or damages caused by
            service downtime or errors.
          </li>
          <li>
            Maintenance, fixes, or updates may occur at any time without notice.
          </li>
        </ul>

        <h2>7. Termination</h2>
        <ul>
          <li>You may terminate your account at any time.</li>
          <li>We may suspend or terminate accounts that violate these Terms.</li>
          <li>
            Termination does not remove data required for legal compliance or platform integrity.
          </li>
        </ul>

        <h2>8. Changes to Terms</h2>
        <ul>
          <li>We may modify these Terms at any time.</li>
          <li>Major changes will be communicated by email or on the Service.</li>
          <li>Continued use after changes means you accept the updated Terms.</li>
        </ul>

        <h2>9. Limitation of Liability</h2>
        <p>
          Bloxion is not liable for direct, indirect, incidental, or consequential
          damages arising from use or inability to use the Service, including loss
          of data, revenue, or reputation. Use the Service at your own risk.
        </p>

        <h2>10. Indemnification</h2>
        <p>
          You agree to defend, indemnify, and hold harmless Bloxion, its staff,
          affiliates, and partners from any claims, damages, or expenses resulting
          from your use of the Service or violation of these Terms.
        </p>

        <h2>11. Governing Law</h2>
        <p>
          These Terms are governed by the laws of the United Kingdom. Disputes will be handled
          in UK courts to the maximum extent permitted by law.
        </p>

        <h2>12. Contact Information</h2>
        <p>Support: https://bloxion.xyz</p>
        <p>DMCA: admin@bloxion.xyz</p>
      </div>
    </>
  );
}