/**
 * Utility untuk fetch data dari API Siproper (dev2.siproper.cloud).
 * Menggunakan auth mobile endpoint yang sama dengan login flow.
 */

let cachedToken: string | null = null;
let tokenExpiry = 0;

async function getSiproperToken(): Promise<string | null> {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken;

  const authUrl = process.env.SIPROPER_AUTH_URL;
  const email = process.env.SIPROPER_API_EMAIL;
  const password = process.env.SIPROPER_API_PASSWORD;

  if (!authUrl || !email || !password) {
    console.warn("[siproper-api] SIPROPER_API_EMAIL / SIPROPER_API_PASSWORD belum dikonfigurasi");
    return null;
  }

  try {
    const res = await fetch(authUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    });
    const json = await res.json();
    if (!res.ok || json?.status !== "success") {
      console.error("[siproper-api] Auth gagal:", json?.message);
      return null;
    }
    // Handle berbagai field token yang mungkin dikembalikan
    const token =
      json.data?.token ??
      json.data?.access_token ??
      json.token ??
      json.access_token ??
      null;

    if (!token) {
      console.error("[siproper-api] Token tidak ditemukan dalam respons auth");
      return null;
    }

    cachedToken = token;
    tokenExpiry = Date.now() + 50 * 60 * 1000; // cache 50 menit
    return token;
  } catch (err) {
    console.error("[siproper-api] Error saat auth:", err);
    return null;
  }
}

export async function siproperFetch<T = unknown>(path: string): Promise<T> {
  const base = process.env.SIPROPER_API_BASE ?? "https://dev2.siproper.cloud";
  const token = await getSiproperToken();

  const res = await fetch(`${base}${path}`, {
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    next: { revalidate: 300 },
  });

  const json = await res.json();

  if (!res.ok) {
    // Token expired — reset cache dan retry sekali
    if (res.status === 401) {
      cachedToken = null;
      tokenExpiry = 0;
      const newToken = await getSiproperToken();
      const retry = await fetch(`${base}${path}`, {
        headers: {
          Accept: "application/json",
          ...(newToken ? { Authorization: `Bearer ${newToken}` } : {}),
        },
        next: { revalidate: 300 },
      });
      if (!retry.ok) throw new Error(`[siproper-api] ${path} → ${retry.status}`);
      return retry.json();
    }
    throw new Error(`[siproper-api] ${path} → ${res.status}: ${json?.message ?? "Error"}`);
  }

  return json as T;
}
