import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const isAuthPage = request.nextUrl.pathname.startsWith("/auth");

  if (isAuthPage) {
    if (token) {
      // If user is already logged in and tries to access auth pages,
      // redirect to dashboard
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    // Allow access to auth pages if not logged in
    return NextResponse.next();
  }

  // Protect dashboard and other private routes
  if (!token && request.nextUrl.pathname.startsWith("/dashboard")) {
    // Redirect unauthenticated users to login page
    return NextResponse.redirect(
      new URL("/auth/signin", request.url)
    );
  }

  return NextResponse.next();
}

// Configure which routes to protect
export const config = {
  matcher: ["/dashboard/:path*", "/auth/:path*"],
};
