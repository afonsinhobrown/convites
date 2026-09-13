import { NextRequest, NextResponse } from "next/server";
import {
  ORGANIZER_COOKIE_NAME,
  verifyOrganizerSessionToken,
} from "@/lib/organizer-auth";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const superadminPublicPaths = ["/superadmin/login", "/api/superadmin/login"];
  const organizerPublicPaths = [
    "/organizer/login",
    "/organizer/register",
    "/api/organizer/login",
    "/api/organizer/register",
  ];

  const isSuperadminRoute =
    pathname.startsWith("/superadmin") || pathname.startsWith("/api/superadmin");
  const isOrganizerRoute =
    pathname.startsWith("/organizer") || pathname.startsWith("/api/organizer");
  const isDesignerRoute =
    pathname.startsWith("/designer") || pathname.startsWith("/api/designer");

  if (isDesignerRoute) {
    if (pathname === "/designer/login" || pathname === "/api/designer/login") return NextResponse.next();
    const token = request.cookies.get("superadmin_token")?.value;
    if (token !== process.env.SUPERADMIN_COOKIE_SECRET) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
      }
      const loginUrl = new URL("/designer/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  if (isSuperadminRoute) {
    if (superadminPublicPaths.includes(pathname)) return NextResponse.next();
    const token = request.cookies.get("superadmin_token")?.value;
    if (token !== process.env.SUPERADMIN_COOKIE_SECRET) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
      }
      const loginUrl = new URL("/superadmin/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  if (isOrganizerRoute) {
    if (organizerPublicPaths.includes(pathname)) return NextResponse.next();
    const token = request.cookies.get(ORGANIZER_COOKIE_NAME)?.value;
    const organizerId = token ? await verifyOrganizerSessionToken(token) : null;
    if (!organizerId) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
      }
      const loginUrl = new URL("/organizer/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/superadmin/:path*",
    "/api/superadmin/:path*",
    "/organizer/:path*",
    "/api/organizer/:path*",
    "/designer/:path*",
    "/api/designer/:path*",
  ],
};