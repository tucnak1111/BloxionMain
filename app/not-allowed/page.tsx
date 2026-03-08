import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";
import { prisma } from "../../prisma/Client";
import "./style.css";

interface JwtPayload extends jwt.JwtPayload {
  id: string;
}

/**
 * Fetches the current user's suspension status from the database.
 */
async function getCurrentUser() {
  const token = (await cookies()).get("bloxion_auth")?.value;
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        isSuspended: true,
        suspendedReason: true,
        username: true,
      },
    });
    return user;
  } catch (error) {
    // Invalid token, treat as logged out
    return null;
  }
}

export default async function SuspendedPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const user = await getCurrentUser();
  const params = await searchParams;
  const reasonFromQuery = params.reason ? decodeURIComponent(params.reason) : null;

  // Allow rendering even without an active cookie so suspended users can still see the message.
  if (!user && !reasonFromQuery) redirect("/login");

  // If user is logged in but NOT suspended, redirect to dashboard
  if (user && !user.isSuspended) {
    redirect("/dashboard");
  }

  const suspensionReason = user?.suspendedReason || reasonFromQuery || "No reason was provided.";

  return (
    <div className="not-allowed-page">
      <div className="login-form">
        <h1 style={{ color: "#ef4444", marginBottom: "0.5em", fontWeight: 650 }}>
          Account Suspended
        </h1>
        <p style={{ color: "#d1d5db", marginTop: 0, marginBottom: "1.5em" }}>
          Your access to Bloxion has been restricted.
        </p>

        <div style={{ textAlign: "left" }}>
          <h2 style={{ fontSize: "1em", fontWeight: 600, color: "#f3f4f6" }}>Reason for Suspension:</h2>
          <div style={{ marginTop: "0.5em", borderRadius: "6px", background: "rgba(255, 255, 255, 0.1)", padding: "1em" }}>
            <p style={{ margin: 0, color: "#d1d5db" }}>{suspensionReason}</p>
          </div>
        </div>

        <p style={{ marginTop: "2em", fontSize: "0.8em", color: "#9ca3af" }}>If you believe this is a mistake, please contact support.</p>
        <a href="/api/auth/logout" className="lf--submit" style={{ textDecoration: 'none', marginTop: '1.5em', textAlign: 'center' }}>Log out</a>

        <div style={{ marginTop: '2em', fontSize: '0.75em', color: '#9ca3af' }}>
          <a href="https://docs.bloxion.xyz/legal/privacy" target="_blank" rel="noopener noreferrer" style={{ color: '#9ca3af', textDecoration: 'none' }}>Privacy Policy</a>
          <span style={{ margin: '0 0.5em' }}>&bull;</span>
          <a href="https://docs.bloxion.xyz/legal/terms" target="_blank" rel="noopener noreferrer" style={{ color: '#9ca3af', textDecoration: 'none' }}>Terms of Service</a>
        </div>
      </div>
    </div>
  );
}
