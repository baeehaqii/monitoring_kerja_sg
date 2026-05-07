import { Header } from "@/components/layout/Header";
import { siproperFetch } from "@/lib/siproper-api";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { FolderKanban, AlertTriangle } from "lucide-react";

type Proyek = {
  id: number;
  nama_proyek: string;
  unit_bisnis: { unit_bisnis: string } | null;
  lgl_area: { area: string | null } | null;
  alamat_proyek: string | null;
  singkatan_pt: string | null;
  pt_proyek: string | null;
};

function str(v: unknown): string {
  if (v === null || v === undefined || v === "") return "—";
  return String(v);
}

async function fetchProyek(): Promise<{ data: Proyek[]; error?: string }> {
  const candidates = ["/api/proyek", "/api/projects", "/api/project"];
  for (const endpoint of candidates) {
    try {
      const res = await siproperFetch<{ data?: Proyek[] } | Proyek[]>(endpoint);
      const data = Array.isArray(res) ? res : ((res as { data?: Proyek[] }).data ?? []);
      return { data };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (!msg.includes("→ 5")) return { data: [], error: msg };
    }
  }
  return {
    data: [],
    error: "Semua endpoint proyek gagal (500). Bug di API Siproper — hubungi tim Siproper untuk perbaiki /api/proyek.",
  };
}

export default async function ProyekPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) redirect("/");

  const { data, error } = await fetchProyek();

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
          <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
            <FolderKanban className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-700">{data.length} proyek</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide w-10">#</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide min-w-[180px]">Nama Proyek</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Unit Bisnis</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Area</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide min-w-[200px]">Alamat</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">PT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.map((row, i) => (
                  <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-slate-400 text-xs">{i + 1}</td>
                    <td className="px-4 py-3 text-slate-500">{row.id}</td>
                    <td className="px-4 py-3 text-slate-700 font-medium">{str(row.nama_proyek)}</td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{str(row.unit_bisnis?.unit_bisnis)}</td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{str(row.lgl_area?.area)}</td>
                    <td className="px-4 py-3 text-slate-600 max-w-[240px] truncate">{str(row.alamat_proyek)}</td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{str(row.singkatan_pt ?? row.pt_proyek)}</td>
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
