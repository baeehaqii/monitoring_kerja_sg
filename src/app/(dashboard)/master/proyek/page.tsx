import { Header } from "@/components/layout/Header";
import { siproperFetch } from "@/lib/siproper-api";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { FolderKanban, AlertTriangle } from "lucide-react";

type Proyek = Record<string, unknown>;

type SiproperResponse = { data?: Proyek[]; success?: boolean } | Proyek[];

function getValue(obj: Record<string, unknown>, key: string): string {
  const v = obj[key];
  if (v === null || v === undefined) return "—";
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

async function fetchProyek(): Promise<{ data: Proyek[]; endpoint: string; error?: string }> {
  // Coba beberapa endpoint — /api/proyek sering broken di Siproper
  const candidates = ["/api/proyek", "/api/projects", "/api/project"];

  for (const endpoint of candidates) {
    try {
      const res = await siproperFetch<SiproperResponse>(endpoint);
      const data = Array.isArray(res) ? res : ((res as { data?: Proyek[] }).data ?? []);
      return { data, endpoint };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      // Lanjut ke endpoint berikutnya hanya jika server error (5xx)
      if (!msg.includes("→ 5")) {
        return { data: [], endpoint, error: msg };
      }
    }
  }

  return {
    data: [],
    endpoint: candidates[0],
    error:
      "Semua endpoint proyek gagal (500). Kemungkinan bug di API Siproper — hubungi tim Siproper untuk memperbaiki endpoint /api/proyek.",
  };
}

export default async function ProyekPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const role = session.user.role;
  if (!["SUPER_ADMIN", "ADMIN"].includes(role)) redirect("/");

  const { data, endpoint, error } = await fetchProyek();
  const columns = data.length > 0 ? Object.keys(data[0]) : [];

  return (
    <div>
      <Header title="Proyek" subtitle="Data proyek dari Siproper" />

      {error ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-800">Gagal mengambil data proyek</p>
              <p className="text-xs text-amber-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      ) : data.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white px-5 py-12 text-center text-sm text-slate-400">
          Tidak ada data
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <FolderKanban className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-medium text-slate-700">{data.length} proyek</span>
            </div>
            <span className="text-xs text-slate-400 font-mono">{endpoint}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide w-12">#</th>
                  {columns.map((col) => (
                    <th key={col} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                      {col.replace(/_/g, " ")}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-slate-400 text-xs">{i + 1}</td>
                    {columns.map((col) => (
                      <td key={col} className="px-4 py-3 text-slate-700 whitespace-nowrap max-w-[240px] truncate">
                        {getValue(row, col)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
