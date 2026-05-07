import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const siproperConfigured =
    !!process.env.SIPROPER_AUTH_URL &&
    !!process.env.SIPROPER_API_EMAIL &&
    !!process.env.SIPROPER_API_PASSWORD;

  let siproperAuth: "ok" | "fail" | "not_configured" = "not_configured";
  let siproperError: string | null = null;

  if (siproperConfigured) {
    try {
      const res = await fetch(process.env.SIPROPER_AUTH_URL!, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: process.env.SIPROPER_API_EMAIL,
          password: process.env.SIPROPER_API_PASSWORD,
        }),
        cache: "no-store",
        signal: AbortSignal.timeout(8000),
      });
      const json = await res.json().catch(() => null);
      siproperAuth = res.ok && json?.status === "success" ? "ok" : "fail";
      if (siproperAuth === "fail") {
        siproperError = `HTTP ${res.status} — ${json?.message ?? "no message"}`;
      }
    } catch (e: unknown) {
      siproperAuth = "fail";
      siproperError = e instanceof Error ? e.message : String(e);
    }
  }

  return NextResponse.json({
    status: "ok",
    env: {
      NODE_ENV: process.env.NODE_ENV,
      SIPROPER_AUTH_URL: process.env.SIPROPER_AUTH_URL
        ? process.env.SIPROPER_AUTH_URL.replace(/\/\/.*@/, "//***@")
        : null,
      SIPROPER_API_BASE: process.env.SIPROPER_API_BASE ?? null,
      SIPROPER_API_EMAIL_SET: !!process.env.SIPROPER_API_EMAIL,
      SIPROPER_API_PASSWORD_SET: !!process.env.SIPROPER_API_PASSWORD,
    },
    siproper: {
      configured: siproperConfigured,
      auth: siproperAuth,
      error: siproperError,
    },
  });
}
