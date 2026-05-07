import { Header } from "@/components/layout/Header";
import { siproperFetch } from "@/lib/siproper-api";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { MapPin } from "lucide-react";

type Area = Record<string, unknown>;

type Col = { label: string; fields: string[] };

const COLUMNS: Col[] = [
  { label: "ID",           fields: ["id"] },
  { label: "Nama Area",    fields: ["nama_area", "nama", "name"] },
  { label: "Unit Bisnis",  fields: ["unit_bisnis", "unitBisnis", "unit_bisnis_nama", "nama_unit_bisnis"] },
];

function pick(row: Area, fields: string[]): string {
  for (const f of fields) {
    const v = row[f];
    if (v !== null && v !== undefined) return resolveValue(v);
  }
  return "—";
}

function resolveValue(v: unknown): string {
  if (v === null || v === undefined) return "—";
  if (Array.isArray(v)) {
    if (v.length === 0) return "—";
    return v.map(resolveValue).join(", ");
  }
  if (typeof v === "object") {
    const o = v as Record<string, unknown>;
    const name =
      o.nama_unit_bisnis ?? o.nama_area ?? o.nama ?? o.name;
    return name ? String(name) : "—";
  }
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
                  {COLUMNS.map((c) => (
                    <th key={c.label} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                      {c.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-slate-400 text-xs">{i + 1}</td>
                    {COLUMNS.map((c) => (
                      <td key={c.label} className="px-4 py-3 text-slate-700 max-w-[280px] truncate">
                        {pick(row, c.fields)}
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
