import { jwtVerify, importSPKI } from "jose";

const PUBLIC_KEY_PEM = `-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEbcus1MBf+pMzegYvjrX2NGXhk9AW
C9cC0mFciM1x3MbCMAtzTTZplLGerIe4dI2ZgX/U/yIQRqkqxHHVMFcAIA==
-----END PUBLIC KEY-----`;

const APP_ID = "monitoring-kerja-sg-v1";
const ALG = "ES256";

export type LicenseStatus =
  | { valid: true; licensee: string; domain: string; expiresAt: Date }
  | { valid: false; reason: "missing" | "invalid_signature" | "expired" | "domain_mismatch" | "wrong_app" };

let cachedStatus: { status: LicenseStatus; checkedAt: number } | null = null;
const CACHE_TTL_MS = 60 * 1000;

function normalizeHost(host: string): string {
  return host.split(":")[0].toLowerCase().trim();
}

export async function validateLicense(host: string): Promise<LicenseStatus> {
  const now = Date.now();

  if (cachedStatus && now - cachedStatus.checkedAt < CACHE_TTL_MS) {
    if (cachedStatus.status.valid) {
      const currentHost = normalizeHost(host);
      const licensedDomain = cachedStatus.status.domain;
      if (currentHost !== "localhost" && currentHost !== licensedDomain) {
        return { valid: false, reason: "domain_mismatch" };
      }
    }
    return cachedStatus.status;
  }

  const rawKey = process.env.LICENSE_KEY;

  if (!rawKey?.trim()) {
    cachedStatus = { status: { valid: false, reason: "missing" }, checkedAt: now };
    return cachedStatus.status;
  }

  const licenseKey = rawKey
    .replace(/[^\x00-\x7F]/g, "")
    .replace(/['"]/g, "")
    .trim();

  if (!licenseKey) {
    cachedStatus = { status: { valid: false, reason: "missing" }, checkedAt: now };
    return cachedStatus.status;
  }

  try {
    const publicKey = await importSPKI(PUBLIC_KEY_PEM, ALG);

    const { payload } = await jwtVerify(licenseKey, publicKey, {
      algorithms: [ALG],
      clockTolerance: 30,
    });

    if (payload["appId"] !== APP_ID) {
      cachedStatus = { status: { valid: false, reason: "wrong_app" }, checkedAt: now };
      return cachedStatus.status;
    }

    const licensedDomain = (payload["domain"] as string ?? "").toLowerCase().trim();
    const currentHost = normalizeHost(host);
    const expiresAt = new Date((payload.exp ?? 0) * 1000);

    if (expiresAt < new Date()) {
      cachedStatus = { status: { valid: false, reason: "expired" }, checkedAt: now };
      return cachedStatus.status;
    }

    if (currentHost !== "localhost" && currentHost !== licensedDomain) {
      return { valid: false, reason: "domain_mismatch" };
    }

    const status: LicenseStatus = {
      valid: true,
      licensee: (payload["licensee"] as string) ?? "Unknown",
      domain: licensedDomain,
      expiresAt,
    };

    cachedStatus = { status, checkedAt: now };
    return status;

  } catch (err: unknown) {
    const isExpired =
      err instanceof Error && err.message.toLowerCase().includes("exp");

    cachedStatus = {
      status: { valid: false, reason: isExpired ? "expired" : "invalid_signature" },
      checkedAt: now,
    };
    return cachedStatus.status;
  }
}

export function isExcludedFromLicenseCheck(pathname: string): boolean {
  const excluded = [
    "/license-invalid",
    "/login",
    "/_next",
    "/favicon.ico",
    "/api/auth",
  ];
  return excluded.some((prefix) => pathname.startsWith(prefix));
}
