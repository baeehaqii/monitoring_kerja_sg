/**
 * src/lib/license.ts
 * Validasi license key menggunakan ECDSA public key yang di-hardcode.
 * Public key TIDAK rahasia — hanya bisa digunakan untuk verifikasi.
 * Private key (untuk sign) hanya ada di MacBook pengembang.
 */

import { jwtVerify, importSPKI } from "jose";

// ── Public key di-hardcode (BUKAN rahasia, aman di source code) ──────────
// Dihasilkan oleh scripts/setup-license.sh di MacBook pengembang.
// Siapapun yang clone repository TIDAK bisa generate key valid tanpa private key.
const PUBLIC_KEY_PEM = `-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEbcus1MBf+pMzegYvjrX2NGXhk9AW
C9cC0mFciM1x3MbCMAtzTTZplLGerIe4dI2ZgX/U/yIQRqkqxHHVMFcAIA==
-----END PUBLIC KEY-----`;

const APP_ID = "monitoring-kerja-sg-v1";
const ALG = "ES256";

export type LicenseStatus =
  | { valid: true; licensee: string; domain: string; expiresAt: Date }
  | { valid: false; reason: "missing" | "invalid_signature" | "expired" | "domain_mismatch" | "wrong_app" };

// Cache hasil validasi (hindari verify JWT di setiap request)
let cachedStatus: { status: LicenseStatus; checkedAt: number } | null = null;
const CACHE_TTL_MS = 60 * 1000; // re-validasi tiap 1 menit

/**
 * Normalisasi hostname: hapus port, lowercase.
 * Contoh: "localhost:3000" → "localhost"
 */
function normalizeHost(host: string): string {
  return host.split(":")[0].toLowerCase().trim();
}

/**
 * Validasi license key terhadap hostname yang sedang diakses.
 */
export async function validateLicense(host: string): Promise<LicenseStatus> {
  const now = Date.now();

  // Gunakan cache jika masih fresh
  if (cachedStatus && now - cachedStatus.checkedAt < CACHE_TTL_MS) {
    // Tetap cek domain meski dari cache (bisa beda request host)
    if (cachedStatus.status.valid) {
      const currentHost = normalizeHost(host);
      const licensedDomain = cachedStatus.status.domain;
      if (currentHost !== "localhost" && currentHost !== licensedDomain) {
        return { valid: false, reason: "domain_mismatch" };
      }
    }
    return cachedStatus.status;
  }

  const licenseKey = process.env.LICENSE_KEY;

  if (!licenseKey?.trim()) {
    cachedStatus = { status: { valid: false, reason: "missing" }, checkedAt: now };
    return cachedStatus.status;
  }

  try {
    const publicKey = await importSPKI(PUBLIC_KEY_PEM, ALG);

    const { payload } = await jwtVerify(licenseKey, publicKey, {
      algorithms: [ALG],
      clockTolerance: 30, // toleransi 30 detik clock skew
    });

    // Validasi app ID
    if (payload["appId"] !== APP_ID) {
      cachedStatus = { status: { valid: false, reason: "wrong_app" }, checkedAt: now };
      return cachedStatus.status;
    }

    const licensedDomain = (payload["domain"] as string ?? "").toLowerCase().trim();
    const currentHost = normalizeHost(host);
    const expiresAt = new Date((payload.exp ?? 0) * 1000);

    // Expired check (jose sudah handle, tapi double-check)
    if (expiresAt < new Date()) {
      cachedStatus = { status: { valid: false, reason: "expired" }, checkedAt: now };
      return cachedStatus.status;
    }

    // Domain check — localhost selalu diizinkan (development)
    if (currentHost !== "localhost" && currentHost !== licensedDomain) {
      // Tidak di-cache karena bisa beda domain per request
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
    // JWT invalid signature, malformed, atau expired
    const isExpired =
      err instanceof Error && err.message.toLowerCase().includes("exp");

    cachedStatus = {
      status: { valid: false, reason: isExpired ? "expired" : "invalid_signature" },
      checkedAt: now,
    };
    return cachedStatus.status;
  }
}

/**
 * Helper: apakah route ini dikecualikan dari pengecekan license?
 * (halaman error, aset statis, API internal)
 */
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
