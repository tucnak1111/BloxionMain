"use client";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-neutral-900 border border-neutral-800 rounded-2xl p-8 shadow-xl">
        
        <h1 className="text-2xl font-semibold text-center mb-2">
          Privacy Policy
        </h1>
        <p className="text-neutral-400 text-center mb-8 text-sm">
          Last updated: <span className="text-neutral-300">[DATE]</span>
        </p>

        <div className="space-y-4 text-neutral-300 leading-relaxed text-sm">
          <p>
            This Privacy Policy describes how <strong>[YOUR APP NAME]</strong> 
            ("we", "our", or "us") handles your data when you use our services.
          </p>

          <h2 className="text-lg font-semibold text-white mt-6">Information We Collect</h2>
          <p>
            We may collect and store the following information:
          </p>
          <ul className="list-disc pl-6 space-y-1 text-neutral-400">
            <li>[Example: Roblox User ID, Username, Avatar]</li>
            <li>[Example: Workspace / Group Membership Data]</li>
            <li>[Example: Moderation or Ban Records]</li>
            <li>[Add or remove as needed]</li>
          </ul>

          <h2 className="text-lg font-semibold text-white mt-6">How We Use Your Information</h2>
          <p>
            We may use your data for purposes such as:
          </p>
          <ul className="list-disc pl-6 space-y-1 text-neutral-400">
            <li>[Authenticating your account]</li>
            <li>[Managing Roblox group permissions]</li>
            <li>[Security, moderation, and fraud prevention]</li>
            <li>[Improving our platform]</li>
          </ul>

          <h2 className="text-lg font-semibold text-white mt-6">Data Sharing</h2>
          <p>
            We do not sell or share your personal information except:
          </p>
          <ul className="list-disc pl-6 space-y-1 text-neutral-400">
            <li>[If required by law or legal process]</li>
            <li>[With services necessary to operate the platform]</li>
          </ul>

          <h2 className="text-lg font-semibold text-white mt-6">Your Rights</h2>
          <p>
            You may request at any time to:
          </p>
          <ul className="list-disc pl-6 space-y-1 text-neutral-400">
            <li>[Access or update your data]</li>
            <li>[Request deletion of stored account information]</li>
            <li>[Withdraw consent where applicable]</li>
          </ul>

          <h2 className="text-lg font-semibold text-white mt-6">Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, you can contact us at: <br />
            <span className="text-neutral-200 font-medium">[YOUR CONTACT EMAIL]</span>
          </p>
        </div>

        <div className="mt-10 text-center">
          <a
            href="/"
            className="inline-block px-6 py-3 rounded-lg font-medium bg-gradient-to-r from-teal-400 to-emerald-500 text-black hover:opacity-90 transition"
          >
            Return to Home
          </a>
        </div>
      </div>
    </div>
  );
}