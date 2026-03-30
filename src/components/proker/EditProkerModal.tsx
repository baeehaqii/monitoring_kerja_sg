"use client";
import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { KETERANGAN_OPTIONS, RACI_ACCOUNTABLE, RACI_RESPONSIBLE, RACI_CONSULTED, RACI_INFORMED } from "@/lib/constants";

interface Props {
  open: boolean;
  onClose: () => void;
  programKerja: any;
  onSuccess: () => void;
}

export function EditProkerModal({ open, onClose, programKerja, onSuccess }: Props) {
  const [form, setForm] = useState({
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



  useEffect(() => {
    if (programKerja && open) {
      let td = "";
      if (programKerja.targetDate) {
        // Safe UTC to YYYY-MM-DD local logic to avoid off-by-one errors from .toISOString
        const dateObj = new Date(programKerja.targetDate);
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        td = `${year}-${month}-${day}`;
      }
      setForm({
        name: programKerja.name || "",
        targetDate: td,
        keterangan: programKerja.keterangan || "",
        raciAccountable: programKerja.raciAccountable || "",
        raciResponsible: programKerja.raciResponsible || "",
        raciConsulted: programKerja.raciConsulted || "",
        raciInformed: programKerja.raciInformed || "",
      });
      setError(null);
    }
  }, [programKerja, open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch(`/api/proker/${programKerja.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
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

  const f = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm({ ...form, [field]: e.target.value });

  return (
    <Modal open={open} onClose={onClose} title={`Edit Program Kerja #${programKerja?.number}`} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Input label="Nomor (Readonly)" type="number" disabled value={programKerja?.number || ""} placeholder="1" />
          <Select
            label="Keterangan"
            value={form.keterangan}
            onChange={f("keterangan")}
            options={KETERANGAN_OPTIONS.map((k) => ({ value: k.value, label: k.label }))}
            placeholder="— Pilih —"
          />
        </div>
        <Input label="Nama Program Kerja" required value={form.name} onChange={f("name")} placeholder="Nama program kerja..." />
        <Input
          label="Target Date"
          type="date"
          required
          value={form.targetDate}
          onChange={f("targetDate")}
        />

        <div className="border-t border-slate-100 pt-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Matriks RACI</p>
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Accountable (A)"
              value={form.raciAccountable}
              onChange={f("raciAccountable")}
              options={RACI_ACCOUNTABLE.map((r) => ({ value: r, label: r }))}
              placeholder="— Pilih —"
            />
            <Select
              label="Responsible (R)"
              value={form.raciResponsible}
              onChange={f("raciResponsible")}
              options={RACI_RESPONSIBLE.map((r) => ({ value: r, label: r }))}
              placeholder="— Pilih —"
            />
            <Select
              label="Consulted (C)"
              value={form.raciConsulted}
              onChange={f("raciConsulted")}
              options={RACI_CONSULTED.map((r) => ({ value: r, label: r }))}
              placeholder="— Pilih —"
            />
            <Select
              label="Informed (I)"
              value={form.raciInformed}
              onChange={f("raciInformed")}
              options={RACI_INFORMED.map((r) => ({ value: r, label: r }))}
              placeholder="— Pilih —"
            />
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
