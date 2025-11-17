import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { redirect } from "next/navigation";

export default function AppLayout({ children }) {
  const token = cookies().get("bloxion_auth")?.value;
  if (!token) redirect("/login");

  try {
    jwt.verify(token, process.env.JWT_SECRET!);
  } catch {
    redirect("/login");
  }

  return <>{children}</>;
}
