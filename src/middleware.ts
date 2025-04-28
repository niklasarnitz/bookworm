import { auth } from "~/server/auth";
import { NextResponse } from "next/server";

const publicRoutes = ["/signin", "/signup", "/api/auth"];

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const isPublicRoute = publicRoutes.some((route) =>
    nextUrl.pathname.startsWith(route),
  );

  if (isPublicRoute || nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/signin", nextUrl));
  }

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
