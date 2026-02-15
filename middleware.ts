import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_CONFIG } from "@/lib/auth-config";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Helper to get absolute URL for redirects that works behind proxies
  const getAbsoluteUrl = (path: string) => {
    const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || request.nextUrl.host;
    const proto = request.headers.get("x-forwarded-proto") || (request.nextUrl.protocol === "https:" ? "https" : "http");
    // Handle potential comma-separated values from multiple proxies
    const cleanHost = host.split(',')[0].trim();
    const cleanProto = proto.split(',')[0].trim();
    return `${cleanProto}://${cleanHost}${path}`;
  };

  let token = request.cookies.get(AUTH_CONFIG.storageTokenKeyName)?.value;

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

  // Special handling for unauthorized redirect to login
  if (pathname === "/login" && request.nextUrl.searchParams.get("error") === "unauthorized") {
    console.log(`[Middleware] Unauthorized error detected, clearing cookies and staying at /login`);
    const response = NextResponse.next();
    const host = request.headers.get("host") || "";
    const isPayerOneDomain = host.endsWith(".payerone.com") || host === "payerone.com";
    const cookieDomain = isPayerOneDomain ? ".payerone.com" : undefined;

    // Clear main token
    response.cookies.delete({
      name: AUTH_CONFIG.storageTokenKeyName,
      path: "/",
      domain: cookieDomain,
    });

    // Clear chunks if any
    const chunkCount = request.cookies.get(AUTH_CONFIG.chunkCountKeyName)?.value;
    if (chunkCount) {
      const count = parseInt(chunkCount, 10);
      for (let i = 0; i < count; i++) {
        response.cookies.delete({
          name: `${AUTH_CONFIG.chunkPrefix}${i}`,
          path: "/",
          domain: cookieDomain,
        });
      }
      response.cookies.delete({
        name: AUTH_CONFIG.chunkCountKeyName,
        path: "/",
        domain: cookieDomain,
      });
    }

    return response;
  }

  if (!token && !isPublicPath) {
    console.log(`[Middleware] No token and not public path, redirecting to /login`);
    // Redirect to login if trying to access a protected route without a token
    return NextResponse.redirect(new URL(getAbsoluteUrl("/login")));
  }

  if (token && (pathname === "/login" || pathname.startsWith("/login/"))) {
    console.log(`[Middleware] Token present and at /login, redirecting to /`);
    // Redirect to home if already logged in and trying to access login page
    return NextResponse.redirect(new URL(getAbsoluteUrl("/")));
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
