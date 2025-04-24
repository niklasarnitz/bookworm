import { auth } from "~/server/auth";
import { NextResponse } from "next/server";

// Define public routes that don't require authentication
const publicRoutes = ["/signin", "/signup", "/api/auth"];

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  // Allow access to public routes without authentication
  const isPublicRoute = publicRoutes.some((route) =>
    nextUrl.pathname.startsWith(route),
  );

  // If the route is public or API route, allow access
  if (isPublicRoute || nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // If the user is not logged in and trying to access a protected route, redirect to login
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/signin", nextUrl));
  }

  // If the user is logged in, allow access to all routes
  return NextResponse.next();
});

export const config = {
  // Match all request paths except for the ones starting with:
  // - api/auth (NextAuth API routes)
  // - _next/static (static files)
  // - _next/image (image optimization files)
  // - favicon.ico (favicon file)
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
  runtime: "nodejs",
};
