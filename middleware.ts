import { NextRequest, NextResponse } from "next/server";

const PROTECTED_PATHS = ["/checkout", "/account", "/admin"];

const getAuthToken = (request: NextRequest) => {
  return (
    request.cookies.get("nouveau_auth_token")?.value ||
    request.cookies.get("token")?.value ||
    request.cookies.get("jwt")?.value ||
    ""
  ).trim();
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  const needsAuth = PROTECTED_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
  if (!needsAuth) {
    return NextResponse.next();
  }

  if (getAuthToken(request)) {
    return NextResponse.next();
  }

  if (pathname === "/auth") {
    return NextResponse.next();
  }

  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = "/auth";
  redirectUrl.searchParams.set("redirect", `${pathname}${request.nextUrl.search}`);

  return NextResponse.redirect(redirectUrl);
}

export const config = {
  matcher: ["/checkout/:path*", "/account/:path*", "/admin/:path*", "/auth"],
};