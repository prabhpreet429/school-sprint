import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("token")?.value || req.headers.get("authorization")?.split(" ")[1];
  
  const publicPaths = ["/sign-in", "/sign-up"];
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));

  // Allow public paths
  if (isPublicPath) {
    // If user is already authenticated and tries to access sign-in/sign-up, redirect to home
    if (token) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  }

  // Protect all other routes
  if (!token) {
    const signUpUrl = new URL("/sign-up", req.url);
    return NextResponse.redirect(signUpUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
