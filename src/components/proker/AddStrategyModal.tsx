"use client";
import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";

type Division = { id: string; name: string };
type Period = { id: string; name: string };

interface Props {
  open: boolean;
  onClose: () => void;
  divisions: Division[];
  periods: Period[];
  onSuccess: () => void;
}

export function AddStrategyModal({ open, onClose, divisions, periods, onSuccess }: Props) {
  const [form, setForm] = useState({ divisionId: "", periodId: "", number: "", name: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/strategies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Terjadi kesalahan");
      return;
    }

    setForm({ divisionId: "", periodId: "", number: "", name: "" });
    onSuccess();
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="Tambah Strategi">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Divisi"
          required
          value={form.divisionId}
          onChange={(e) => setForm({ ...form, divisionId: e.target.value })}
          options={divisions.map((d) => ({ value: d.id, label: d.name }))}
          placeholder="Pilih divisi..."
        />
        <Select
          label="Periode"
          required
          value={form.periodId}
          onChange={(e) => setForm({ ...form, periodId: e.target.value })}
          options={periods.map((p) => ({ value: p.id, label: p.name }))}
          placeholder="Pilih periode..."
        />
        <Input
          label="Nomor Strategi"
          type="number"
          min="1"
          required
          value={form.number}
          onChange={(e) => setForm({ ...form, number: e.target.value })}
          placeholder="1"
        />
        <Input
          label="Nama Strategi"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Nama strategi..."
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>Batal</Button>
          <Button type="submit" loading={loading}>Simpan</Button>
        </div>
      </form>
    </Modal>
  );
}
