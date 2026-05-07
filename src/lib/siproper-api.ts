let cachedToken: string | null = null;
let tokenExpiry = 0;

const AUTH_URL =
  process.env.SIPROPER_AUTH_URL ??
  "https://dev2.siproper.cloud/api/auth/login";

async function getSiproperToken(): Promise<string | null> {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken;

  const email = process.env.SIPROPER_API_EMAIL;
  const password = process.env.SIPROPER_API_PASSWORD;

  if (!email || !password) {
    console.warn("[siproper-api] SIPROPER_API_EMAIL / SIPROPER_API_PASSWORD belum dikonfigurasi");
    return null;
  }

  try {
    const res = await fetch(AUTH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });

    let json: Record<string, unknown> = {};
    try { json = await res.json(); } catch { /* empty body */ }

    if (!res.ok) {
      console.error("[siproper-api] Auth gagal:", res.status, json?.message ?? json?.error);
      return null;
    }

    // Web auth: { status, data: { token } } atau { token } atau { access_token }
    const token =
      (json.data as Record<string, unknown>)?.token ??
      (json.data as Record<string, unknown>)?.access_token ??
      json.token ??
      json.access_token ??
      null;

    if (!token) {
      console.error("[siproper-api] Token tidak ditemukan. Response:", JSON.stringify(json));
      return null;
    }

    cachedToken = token as string;
    tokenExpiry = Date.now() + 50 * 60 * 1000;
    return cachedToken;
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
