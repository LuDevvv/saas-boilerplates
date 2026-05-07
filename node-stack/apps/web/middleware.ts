import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Admin lives in the dashboard SPA (apps/dashboard) under its own
// adminGuard route guard. The marketing web app should never serve
// /admin directly — redirect to the dashboard so there is one
// authoritative auth gate, not two diverging implementations.
const FALLBACK_DASHBOARD_URL = "http://localhost:5173";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith("/admin")) {
    const dashboardUrl =
      process.env.NEXT_PUBLIC_DASHBOARD_URL ?? FALLBACK_DASHBOARD_URL;
    const target = new URL(`/admin${pathname.slice("/admin".length)}${req.nextUrl.search}`, dashboardUrl);
    return NextResponse.redirect(target, 307);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
