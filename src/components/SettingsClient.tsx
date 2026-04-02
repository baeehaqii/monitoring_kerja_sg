"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardSubTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Plus, Calendar, Building2, ShieldCheck, Trash2 } from "lucide-react";

type Week = { id: string; weekNumber: number; label: string };
type Period = {
  id: string;
  name: string;
  year: number;
  month: number;
  weeks: Week[];
  _count: { strategies: number };
};
type Division = {
  id: string;
  name: string;
  _count: { users: number; strategies: number };
};
type RaciType = "ACCOUNTABLE" | "RESPONSIBLE" | "CONSULTED" | "INFORMED";
type RaciEntry = { id: string; role: string; type: RaciType; order: number };
type RaciMatrix = { id: string; name: string; isDefault: boolean; entries: RaciEntry[] };

interface Props {
  periods: Period[];
  divisions: Division[];
  raciMatrices: RaciMatrix[];
}

const MONTHS = [
  "Januari","Februari","Maret","April","Mei","Juni",
  "Juli","Agustus","September","Oktober","November","Desember",
];

const RACI_LABELS: Record<RaciType, { label: string; color: string }> = {
  ACCOUNTABLE: { label: "Accountable", color: "bg-red-50 text-red-600 border-red-100" },
  RESPONSIBLE: { label: "Responsible", color: "bg-blue-50 text-blue-600 border-blue-100" },
  CONSULTED:   { label: "Consulted",   color: "bg-amber-50 text-amber-600 border-amber-100" },
  INFORMED:    { label: "Informed",    color: "bg-green-50 text-green-600 border-green-100" },
};

export function SettingsClient({ periods, divisions, raciMatrices }: Props) {
  const router = useRouter();
  const [addPeriodOpen, setAddPeriodOpen] = useState(false);
  const [addDivisionOpen, setAddDivisionOpen] = useState(false);
  const [addRaciOpen, setAddRaciOpen] = useState(false);
  const [periodForm, setPeriodForm] = useState({ year: "2026", month: "4" });
  const [divisionName, setDivisionName] = useState("");
  const [raciForm, setRaciForm] = useState({ matrixId: "", role: "", type: "RESPONSIBLE" as RaciType });
  const [saving, setSaving] = useState(false);

  const defaultMatrix = raciMatrices.find((m) => m.isDefault) ?? raciMatrices[0];

  async function addPeriod(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/periods", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(periodForm),
    });
    setSaving(false);
    setAddPeriodOpen(false);
    router.refresh();
  }

  async function addDivision(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/divisions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: divisionName }),
    });
    setSaving(false);
    setAddDivisionOpen(false);
    setDivisionName("");
    router.refresh();
  }

  async function addRaciEntry(e: React.FormEvent) {
    e.preventDefault();
    if (!raciForm.matrixId || !raciForm.role.trim()) return;
    setSaving(true);
    await fetch("/api/raci", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(raciForm),
    });
    setSaving(false);
    setAddRaciOpen(false);
    setRaciForm((prev) => ({ ...prev, role: "" }));
    router.refresh();
  }

  async function deleteRaciEntry(entryId: string) {
    await fetch(`/api/raci/${entryId}`, { method: "DELETE" });
    router.refresh();
  }

  function openAddRaci() {
    setRaciForm({
      matrixId: defaultMatrix?.id ?? "",
      role: "",
      type: "RESPONSIBLE",
    });
    setAddRaciOpen(true);
  }

  function groupEntries(entries: RaciEntry[]) {
    const grouped: Partial<Record<RaciType, RaciEntry[]>> = {};
    for (const e of entries) {
      if (!grouped[e.type]) grouped[e.type] = [];
      grouped[e.type]!.push(e);
    }
    return grouped;
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
        <Card className="flex flex-col">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="size-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-[#0f52ba]" />
              </div>
              <div className="flex flex-col">
                <CardTitle>Setting Periode</CardTitle>
                <CardSubTitle>Setting Periode dan Minggu</CardSubTitle>
              </div>
            </div>
            <Button size="sm" onClick={() => setAddPeriodOpen(true)} icon={<Plus className="w-4 h-4" />}>
              Tambah
            </Button>
          </CardHeader>
          <div className="overflow-y-auto max-h-[340px] space-y-2 pr-1">
            {periods.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">Belum ada periode</p>
            ) : (
              periods.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-2 px-3 rounded-lg border border-slate-100 hover:bg-slate-50">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{p.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{p.weeks.length} minggu · {p._count.strategies} strategi</p>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {p.weeks.map((w) => (
                      <span key={w.id} className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">W{w.weekNumber}</span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="size-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-[#0f52ba]" />
              </div>
              <div className="flex flex-col">
                <CardTitle>Divisi</CardTitle>
                <CardSubTitle>Setting Tambah Data Divisi</CardSubTitle>
              </div>
            </div>
            <Button size="sm" onClick={() => setAddDivisionOpen(true)} icon={<Plus className="w-4 h-4" />}>
              Tambah
            </Button>
          </CardHeader>
          <div className="overflow-y-auto max-h-[340px] space-y-2 pr-1">
            {divisions.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">Belum ada divisi</p>
            ) : (
              divisions.map((d) => (
                <div key={d.id} className="flex items-center justify-between py-2 px-3 rounded-lg border border-slate-100 hover:bg-slate-50">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{d.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{d._count.users} pengguna · {d._count.strategies} strategi</p>
                  </div>
                  <Badge variant="secondary">{d._count.users} user</Badge>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {defaultMatrix && (
        <Card className="flex flex-col">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="size-8 rounded-lg bg-purple-50 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-purple-600" />
              </div>
              <div className="flex flex-col">
                <CardTitle>Matrix RACI</CardTitle>
                <CardSubTitle>{defaultMatrix.name} · {defaultMatrix.entries.length} entri</CardSubTitle>
              </div>
            </div>
            <Button size="sm" onClick={openAddRaci} icon={<Plus className="w-4 h-4" />}>
              Tambah Role
            </Button>
          </CardHeader>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 overflow-y-auto max-h-[420px] pr-1">
            {(["ACCOUNTABLE", "RESPONSIBLE", "CONSULTED", "INFORMED"] as RaciType[]).map((type) => {
              const cfg = RACI_LABELS[type];
              const entries = groupEntries(defaultMatrix.entries)[type] ?? [];
              return (
                <div key={type} className="flex flex-col gap-1.5">
                  <div className={`text-[11px] font-bold px-2 py-1 rounded-md border ${cfg.color} text-center`}>
                    {cfg.label}
                  </div>
                  <div className="flex flex-col gap-1">
                    {entries.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-2">Kosong</p>
                    ) : (
                      entries.map((entry) => (
                        <div
                          key={entry.id}
                          className="group flex items-center justify-between py-1.5 px-2 rounded-lg border border-slate-100 hover:bg-slate-50 transition-all"
                        >
                          <span className="text-xs text-slate-700 truncate">{entry.role}</span>
                          <button
                            onClick={() => deleteRaciEntry(entry.id)}
                            className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-all shrink-0 ml-1"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      <Modal open={addPeriodOpen} onClose={() => setAddPeriodOpen(false)} title="Tambah Periode">
        <form onSubmit={addPeriod} className="space-y-4">
          <Input
            label="Tahun"
            type="number"
            min="2024"
            max="2030"
            required
            value={periodForm.year}
            onChange={(e) => setPeriodForm({ ...periodForm, year: e.target.value })}
          />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Bulan <span className="text-red-500">*</span></label>
            <select
              value={periodForm.month}
              onChange={(e) => setPeriodForm({ ...periodForm, month: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f52ba]/20 focus:border-[#0f52ba]"
            >
              {MONTHS.map((m, i) => (
                <option key={i + 1} value={i + 1}>{m}</option>
              ))}
            </select>
          </div>
          <p className="text-xs text-slate-400">
            Minggu akan otomatis dibuat berdasarkan kalender {MONTHS[Number(periodForm.month) - 1]} {periodForm.year}.
          </p>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setAddPeriodOpen(false)}>Batal</Button>
            <Button type="submit" loading={saving}>Buat Periode</Button>
          </div>
        </form>
      </Modal>

      <Modal open={addDivisionOpen} onClose={() => setAddDivisionOpen(false)} title="Tambah Divisi">
        <form onSubmit={addDivision} className="space-y-4">
          <Input
            label="Nama Divisi"
            required
            value={divisionName}
            onChange={(e) => setDivisionName(e.target.value)}
            placeholder="mis. Penjualan & Pemasaran"
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setAddDivisionOpen(false)}>Batal</Button>
            <Button type="submit" loading={saving}>Simpan</Button>
          </div>
        </form>
      </Modal>

      <Modal open={addRaciOpen} onClose={() => setAddRaciOpen(false)} title="Tambah Role RACI">
        <form onSubmit={addRaciEntry} className="space-y-4">
          {raciMatrices.length > 1 && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Matrix <span className="text-red-500">*</span></label>
              <select
                value={raciForm.matrixId}
                onChange={(e) => setRaciForm({ ...raciForm, matrixId: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f52ba]/20 focus:border-[#0f52ba]"
              >
                {raciMatrices.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tipe RACI <span className="text-red-500">*</span></label>
            <select
              value={raciForm.type}
              onChange={(e) => setRaciForm({ ...raciForm, type: e.target.value as RaciType })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f52ba]/20 focus:border-[#0f52ba]"
            >
              <option value="ACCOUNTABLE">Accountable</option>
              <option value="RESPONSIBLE">Responsible</option>
              <option value="CONSULTED">Consulted</option>
              <option value="INFORMED">Informed</option>
            </select>
          </div>
          <Input
            label="Nama Role / Jabatan"
            required
            value={raciForm.role}
            onChange={(e) => setRaciForm({ ...raciForm, role: e.target.value })}
            placeholder="mis. Manajer Operasional"
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setAddRaciOpen(false)}>Batal</Button>
            <Button type="submit" loading={saving}>Simpan</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
