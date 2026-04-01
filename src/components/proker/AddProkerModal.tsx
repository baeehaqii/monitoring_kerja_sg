"use client";
import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { KETERANGAN_OPTIONS } from "@/lib/constants";
import { Plus } from "lucide-react";

type RaciType = "ACCOUNTABLE" | "RESPONSIBLE" | "CONSULTED" | "INFORMED";
type RaciEntry = { id: string; role: string; type: RaciType };
type RaciMatrix = { id: string; entries: RaciEntry[] };

interface Props {
  open: boolean;
  onClose: () => void;
  strategyId: string;
  onSuccess: () => void;
  raciMatrix: RaciMatrix;
}

/** Filter entries berdasarkan type dan ubah ke options Select */
function raciOptions(entries: RaciEntry[], type: RaciType) {
  return entries
    .filter((e) => e.type === type)
    .map((e) => ({ value: e.role, label: e.role }));
}

/** Quick-add role baru ke RACI Matrix via API, langsung refresh list */
async function quickAddRaci(
  matrixId: string,
  type: RaciType,
  role: string,
): Promise<boolean> {
  const res = await fetch("/api/raci", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ matrixId, type, role }),
  });
  return res.ok;
}

export function AddProkerModal({ open, onClose, strategyId, onSuccess, raciMatrix }: Props) {
  const [form, setForm] = useState({
    number: "",
    name: "",
    targetDate: "",
    keterangan: "",
    raciAccountable: "",
    raciResponsible: "",
    raciConsulted: "",
    raciInformed: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State untuk quick-add inline per kolom RACI
  const [quickAdd, setQuickAdd] = useState<{ type: RaciType; value: string } | null>(null);
  const [quickSaving, setQuickSaving] = useState(false);
  const [localEntries, setLocalEntries] = useState<RaciEntry[]>(raciMatrix.entries);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/proker", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, strategyId }),
    });

    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Terjadi kesalahan");
      return;
    }

    onSuccess();
    onClose();
  }

  async function handleQuickAdd(type: RaciType) {
    if (!quickAdd || !quickAdd.value.trim()) return;
    setQuickSaving(true);
    const ok = await quickAddRaci(raciMatrix.id, type, quickAdd.value.trim());
    if (ok) {
      // Tambah ke localEntries agar langsung muncul di dropdown
      const newEntry: RaciEntry = {
        id: `temp-${Date.now()}`,
        role: quickAdd.value.trim(),
        type,
      };
      setLocalEntries((prev) => [...prev, newEntry]);
      // Auto-select nilai baru
      const fieldMap: Record<RaciType, string> = {
        ACCOUNTABLE: "raciAccountable",
        RESPONSIBLE: "raciResponsible",
        CONSULTED: "raciConsulted",
        INFORMED: "raciInformed",
      };
      setForm((prev) => ({ ...prev, [fieldMap[type]]: quickAdd.value.trim() }));
      setQuickAdd(null);
    }
    setQuickSaving(false);
  }

  const f = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm({ ...form, [field]: e.target.value });

  const RACI_COLS: { type: RaciType; label: string; field: string }[] = [
    { type: "ACCOUNTABLE", label: "Accountable (A)", field: "raciAccountable" },
    { type: "RESPONSIBLE", label: "Responsible (R)", field: "raciResponsible" },
    { type: "CONSULTED",   label: "Consulted (C)",   field: "raciConsulted" },
    { type: "INFORMED",    label: "Informed (I)",    field: "raciInformed" },
  ];

  return (
    <Modal open={open} onClose={onClose} title="Tambah Program Kerja" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Input label="Nomor" type="number" min="1" required value={form.number} onChange={f("number")} placeholder="1" />
          <Select
            label="Keterangan"
            value={form.keterangan}
            onChange={f("keterangan")}
            options={KETERANGAN_OPTIONS.map((k) => ({ value: k.value, label: k.label }))}
            placeholder="— Pilih —"
          />
        </div>
        <Input label="Nama Program Kerja" required value={form.name} onChange={f("name")} placeholder="Nama program kerja..." />
        <Input label="Target Date" type="date" required value={form.targetDate} onChange={f("targetDate")} />

        <div className="border-t border-slate-100 pt-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Matriks RACI</p>
          <div className="grid grid-cols-2 gap-3">
            {RACI_COLS.map(({ type, label, field }) => (
              <div key={type}>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium text-slate-700">{label}</label>
                  <button
                    type="button"
                    title={`Tambah ${label} baru`}
                    onClick={() => setQuickAdd(quickAdd?.type === type ? null : { type, value: "" })}
                    className="flex items-center gap-0.5 text-[10px] text-blue-500 hover:text-blue-700 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Tambah</span>
                  </button>
                </div>

                {/* Quick-add input inline */}
                {quickAdd?.type === type && (
                  <div className="flex gap-1 mb-1.5">
                    <input
                      type="text"
                      autoFocus
                      placeholder="Nama jabatan baru..."
                      value={quickAdd.value}
                      onChange={(e) => setQuickAdd({ type, value: e.target.value })}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleQuickAdd(type); } }}
                      className="flex-1 px-2 py-1 text-xs border border-blue-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400"
                    />
                    <button
                      type="button"
                      disabled={quickSaving || !quickAdd.value.trim()}
                      onClick={() => handleQuickAdd(type)}
                      className="px-2 py-1 text-xs bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 transition-colors"
                    >
                      {quickSaving ? "..." : "Simpan"}
                    </button>
                  </div>
                )}

                <select
                  value={form[field as keyof typeof form]}
                  onChange={f(field)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f52ba]/20 focus:border-[#0f52ba] bg-white"
                >
                  <option value="">— Pilih —</option>
                  {raciOptions(localEntries, type).map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>Batal</Button>
          <Button type="submit" loading={loading}>Simpan</Button>
        </div>
      </form>
    </Modal>
  );
}
