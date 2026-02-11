import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_CONFIG } from "@/lib/auth-config";

export function middleware(request: NextRequest) {
  let token = request.cookies.get(AUTH_CONFIG.storageTokenKeyName)?.value;
  const { pathname } = request.nextUrl;

  // Reconstruct token if chunked
  if (!token) {
    const chunkCount = request.cookies.get(AUTH_CONFIG.chunkCountKeyName)?.value;
    if (chunkCount) {
      const count = parseInt(chunkCount, 10);
      let fullToken = "";
      for (let i = 0; i < count; i++) {
        const chunk = request.cookies.get(`${AUTH_CONFIG.chunkPrefix}${i}`)?.value;
        if (chunk) {
          fullToken += chunk;
        }
      }
      if (fullToken) {
        token = fullToken;
        console.log(`[Middleware] Token reconstructed from ${count} chunks, total length: ${token.length}`);
      }
    }
  }

  console.log(`[Middleware] Path: ${pathname}, Token present: ${!!token}, Cookies: ${request.cookies.getAll().map(c => c.name).join(", ")}`);

  // Define public paths that don't require authentication
  const isPublicPath =
    pathname === "/login" ||
    pathname.startsWith("/login/") ||
    pathname === "/autho" ||
    pathname.startsWith("/autho/") ||
    pathname.startsWith("/api/public") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt";

  if (!token && !isPublicPath) {
    console.log(`[Middleware] No token and not public path, redirecting to /login`);
    // Redirect to login if trying to access a protected route without a token
    const loginUrl = new URL("/login", request.url);
    // Add current path as callback if needed, but for now just redirect
    return NextResponse.redirect(loginUrl);
  }

  if (token && (pathname === "/login" || pathname.startsWith("/login/"))) {
    console.log(`[Middleware] Token present and at /login, redirecting to /`);
    // Redirect to home if already logged in and trying to access login page
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg|.*\\.png|.*\\.jpg).*)",
  ],
};
