import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";

const PROTECTED_PREFIXES = ["/dashboard", "/onboarding"];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow Next.js internals, public assets, API tracking/slug (public endpoints)
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/track") ||
    pathname.startsWith("/api/slug") ||
    pathname.match(/\.(ico|png|svg|jpg|jpeg|woff2?|ttf)$/)
  ) {
    return NextResponse.next();
  }

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const isPublicSlug =
    !isProtected &&
    !pathname.startsWith("/login") &&
    !pathname.startsWith("/api") &&
    pathname !== "/";

  if (isPublicSlug) return NextResponse.next();

  const session = await getSessionFromRequest(req);

  if (!session) {
    if (pathname.startsWith("/api/auth")) return NextResponse.next();
    if (pathname === "/login") return NextResponse.next();
    if (pathname === "/") return NextResponse.next();
    return NextResponse.redirect(new URL("/?auth=login", req.url));
  }

  // Authenticated: redirect login → dashboard, root → dashboard
  if (pathname === "/login" || pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
