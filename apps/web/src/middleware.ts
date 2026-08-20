import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "mau_session";

/**
 * UX-level gate for /admin: users without a session cookie are bounced to the
 * login page before any admin UI is rendered.
 *
 * This is NOT the security boundary — the cookie's validity is checked
 * server-side by `requireUser()` in the admin layout and by every admin
 * mutation. Middleware cannot reach the database, so it only checks presence.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isLoginRoute = pathname === "/admin/login";
  const hasSessionCookie = request.cookies.has(SESSION_COOKIE);

  if (!isLoginRoute && !hasSessionCookie) {
    const login = new URL("/admin/login", request.url);
    return NextResponse.redirect(login);
  }

  if (isLoginRoute && hasSessionCookie) {
    // Possibly stale cookie; the admin layout will verify and bounce back if not.
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  const response = NextResponse.next();
  // Belt-and-braces: admin pages must never be indexed even if a robots rule slips.
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/admin"],
};
