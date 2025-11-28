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
  const token = cookies().get("bloxion_auth")?.value;
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

export default async function SuspendedPage() {
  const user = await getCurrentUser();

  // If user is not logged in, redirect to login page
  if (!user) {
    redirect("/login");
  }

  // If user is logged in but NOT suspended, redirect to dashboard
  if (!user.isSuspended) {
    redirect("/dashboard");
  }

  return (
    <div className="login-form">
      <h1 style={{ color: "#ef4444", marginBottom: "0.5em" }}>
        Account Suspended
      </h1>
      <p style={{ color: "#d1d5db", marginTop: 0, marginBottom: "1.5em" }}>
        Your access to Bloxion has been restricted.
      </p>

      <div style={{ textAlign: "left" }}>
        <h2 style={{ fontSize: "1em", fontWeight: 600, color: "#f3f4f6" }}>Reason for Suspension:</h2>
        <div style={{ marginTop: "0.5em", borderRadius: "6px", background: "rgba(255, 255, 255, 0.1)", padding: "1em" }}>
          <p style={{ margin: 0, color: "#d1d5db", fontStyle: "italic" }}>{user.suspendedReason || "No reason was provided."}</p>
        </div>
      </div>

      <p style={{ marginTop: "2em", fontSize: "0.8em", color: "#9ca3af" }}>If you believe this is a mistake, please contact support.</p>
    </div>
  );
}
