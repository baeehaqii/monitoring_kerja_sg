import { Header } from "@/components/layout/Header";
import { siproperFetch } from "@/lib/siproper-api";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { MapPin } from "lucide-react";

type Area = {
  id: number;
  nama_area: string;
  unit_bisnis: { id: number; unit_bisnis: string } | null;
};

function str(v: unknown): string {
  if (v === null || v === undefined || v === "") return "—";
  return String(v);
}

export default async function AreasPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) redirect("/");

  let data: Area[] = [];
  let error: string | null = null;

  try {
    const res = await siproperFetch<{ data?: Area[] } | Area[]>("/api/areas");
    data = Array.isArray(res) ? res : ((res as { data?: Area[] }).data ?? []);
  } catch (e: unknown) {
    error = e instanceof Error ? e.message : "Gagal mengambil data";
  }

  return (
    <div>
      <Header title="Area" subtitle="Data area dari Siproper" />

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      ) : data.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white px-5 py-12 text-center text-sm text-slate-400">
          Tidak ada data
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
            <MapPin className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-700">{data.length} area</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide w-10">#</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Nama Area</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Unit Bisnis</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.map((row, i) => (
                  <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-slate-400 text-xs">{i + 1}</td>
                    <td className="px-4 py-3 text-slate-500">{row.id}</td>
                    <td className="px-4 py-3 text-slate-700 font-medium">{str(row.nama_area)}</td>
                    <td className="px-4 py-3 text-slate-600">{str(row.unit_bisnis?.unit_bisnis)}</td>
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
