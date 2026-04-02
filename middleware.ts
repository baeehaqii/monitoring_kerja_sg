/**
 * middleware.ts — Next.js Edge Middleware
 * Memvalidasi license key di setiap request sebelum meneruskan ke halaman.
 * Di mode development (NODE_ENV=development), validasi dilewati sepenuhnya.
 */

import { NextRequest, NextResponse } from "next/server";
import { validateLicense, isExcludedFromLicenseCheck } from "@/lib/license";

export async function middleware(request: NextRequest) {
  // ── Bypass total di local development ─────────────────────
  if (process.env.NODE_ENV === "development") {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  // Skip rute yang dikecualikan
  if (isExcludedFromLicenseCheck(pathname)) {
    return NextResponse.next();
  }

  const host = request.headers.get("host") ?? "localhost";
  const status = await validateLicense(host);

  if (!status.valid) {
    const url = request.nextUrl.clone();
    url.pathname = "/license-invalid";
    url.searchParams.set("reason", status.reason);
    return NextResponse.redirect(url);
  }

  const response = NextResponse.next();
  response.headers.set("x-licensed-to", status.licensee.replace(/[^\x00-\xFF]/g, "").trim() || "Licensed");
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|bg-pattern|images|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
  ],
};
