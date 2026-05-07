import { NextResponse } from "next/server";
import { siproperFetch } from "@/lib/siproper-api";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  async function sample(path: string) {
    try {
      const res = await siproperFetch<unknown>(path);
      const arr = Array.isArray(res)
        ? res
        : ((res as { data?: unknown[] }).data ?? [res]);
      const first = arr[0] ?? null;
      return {
        ok: true,
        total: arr.length,
        fields: first ? Object.keys(first as object) : [],
        sample: first,
      };
    } catch (e: unknown) {
      return { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
  }

  const [unitBisnis, areas, proyek, projects] = await Promise.all([
    sample("/api/unit-bisnis"),
    sample("/api/areas"),
    sample("/api/proyek"),
    sample("/api/projects"),
  ]);

  return NextResponse.json({ unitBisnis, areas, proyek, projects }, { status: 200 });
}
