import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    // Clear the authentication cookie by setting its maxAge to 0
    (await
      // Clear the authentication cookie by setting its maxAge to 0
      cookies()).set("bloxion_auth", "", {
      path: "/",
      httpOnly: true,
      maxAge: 0,
    });

    // Redirect the user to the login page after logging out
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);

  } catch (error) {
    console.error("Failed to log out:", error);
    return NextResponse.json({ error: "An unexpected error occurred during logout." }, { status: 500 });
  }
}