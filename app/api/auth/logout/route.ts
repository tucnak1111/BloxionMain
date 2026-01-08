import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    // Redirect the user to the login page after logging out
    const loginUrl = new URL("/login", req.url);
    const response = NextResponse.redirect(loginUrl);

    // Clear the authentication cookie by setting its maxAge to 0 on the response
    response.cookies.set("bloxion_auth", "", {
      path: "/",
      httpOnly: true,
      maxAge: 0,
    });

    return response;
  } catch (error) {
    console.error("Failed to log out:", error);
    return NextResponse.json({ error: "An unexpected error occurred during logout." }, { status: 500 });
  }
}