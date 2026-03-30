"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Plus, Calendar, Building2, Trash2 } from "lucide-react";

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

interface Props {
  periods: Period[];
  divisions: Division[];
}

const MONTHS = [
  "Januari","Februari","Maret","April","Mei","Juni",
  "Juli","Agustus","September","Oktober","November","Desember",
];

export function SettingsClient({ periods, divisions }: Props) {
  const router = useRouter();
  const [addPeriodOpen, setAddPeriodOpen] = useState(false);
  const [addDivisionOpen, setAddDivisionOpen] = useState(false);
  const [periodForm, setPeriodForm] = useState({ year: "2026", month: "4" });
  const [divisionName, setDivisionName] = useState("");
  const [saving, setSaving] = useState(false);

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
    // Create division via direct API (inline handler)
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* Periods */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#0f52ba]" />
            <CardTitle>Periode</CardTitle>
          </div>
          <Button size="sm" onClick={() => setAddPeriodOpen(true)} icon={<Plus className="w-4 h-4" />}>
            Tambah
          </Button>
        </CardHeader>
        <div className="space-y-2">
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

      {/* Divisions */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#0f52ba]" />
            <CardTitle>Divisi</CardTitle>
          </div>
          <Button size="sm" onClick={() => setAddDivisionOpen(true)} icon={<Plus className="w-4 h-4" />}>
            Tambah
          </Button>
        </CardHeader>
        <div className="space-y-2">
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

      {/* Add Period Modal */}
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

      {/* Add Division Modal */}
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
    </div>
  );
}
