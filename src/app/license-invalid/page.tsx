import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "License Invalid — Monitoring Kerja",
  robots: { index: false },
};

const REASON_MESSAGES: Record<string, { title: string; desc: string }> = {
  missing: {
    title: "License Key Tidak Ditemukan",
    desc: "Aplikasi ini memerlukan license key yang valid. Tambahkan LICENSE_KEY ke file .env dan restart server.",
  },
  invalid_signature: {
    title: "License Key Tidak Valid",
    desc: "Key yang diberikan tidak dapat diverifikasi. Pastikan menggunakan key resmi dari pengembang.",
  },
  expired: {
    title: "License Sudah Kadaluarsa",
    desc: "Masa berlaku license Anda telah habis. Hubungi pengembang untuk perpanjangan.",
  },
  domain_mismatch: {
    title: "Domain Tidak Diizinkan",
    desc: "License ini tidak berlaku untuk domain yang sedang diakses. Hubungi pengembang untuk mendapatkan license baru.",
  },
  wrong_app: {
    title: "License Tidak Cocok",
    desc: "License key ini bukan untuk aplikasi ini.",
  },
};

export default async function LicenseInvalidPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const { reason = "missing" } = await searchParams;
  const info = REASON_MESSAGES[reason] ?? REASON_MESSAGES.missing;

  return (
    <html lang="id">
      <body style={{ margin: 0, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", background: "#f4f2f2" }}>
        <div style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
        }}>
          <div style={{
            background: "white",
            borderRadius: "16px",
            padding: "48px 40px",
            maxWidth: "480px",
            width: "100%",
            boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
            textAlign: "center",
          }}>
            <div style={{
              width: "64px",
              height: "64px",
              borderRadius: "16px",
              background: "#FEF2F2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>

            <p style={{ fontSize: "12px", fontWeight: 600, color: "#DC2626", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "8px" }}>
              License Error
            </p>

            <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#0F172A", marginBottom: "12px", lineHeight: 1.3 }}>
              {info.title}
            </h1>

            <p style={{ fontSize: "14px", color: "#64748B", lineHeight: 1.6, marginBottom: "32px" }}>
              {info.desc}
            </p>

            <div style={{
              background: "#F8FAFC",
              borderRadius: "8px",
              padding: "10px 16px",
              fontSize: "12px",
              color: "#94A3B8",
              fontFamily: "monospace",
            }}>
              Error code: {reason}
            </div>

            <p style={{ marginTop: "24px", fontSize: "13px", color: "#94A3B8" }}>
              Hubungi pengembang di{" "}
              <a href="mailto:support@siproper.com" style={{ color: "#0F52BA", textDecoration: "none" }}>
                support@siproper.com
              </a>
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}
