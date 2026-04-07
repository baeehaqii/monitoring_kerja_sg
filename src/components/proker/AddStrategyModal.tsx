"use client";
import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";

type Period = { id: string; name: string };

interface Props {
  open: boolean;
  onClose: () => void;
  periods: Period[];
  userDivisionId: string | null;
  onSuccess: () => void;
}

export function AddStrategyModal({ open, onClose, periods, userDivisionId, onSuccess }: Props) {
  const [form, setForm] = useState({ periodId: "", name: "" });
  const [nextNumber, setNextNumber] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userDivisionId || !form.periodId) {
      setNextNumber(null);
      return;
    }
    const params = new URLSearchParams({
      divisionId: userDivisionId,
      periodId: form.periodId,
      nextNumber: "1",
    });
    fetch(`/api/strategies?${params}`)
      .then((r) => r.json())
      .then((data) => setNextNumber(data.nextNumber))
      .catch(() => setNextNumber(null));
  }, [form.periodId, userDivisionId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/strategies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ periodId: form.periodId, name: form.name }),
    });

    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Terjadi kesalahan");
      return;
    }

    setForm({ periodId: "", name: "" });
    setNextNumber(null);
    onSuccess();
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="Tambah Strategi">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Periode"
          required
          value={form.periodId}
          onChange={(e) => setForm({ ...form, periodId: e.target.value })}
          options={periods.map((p) => ({ value: p.id, label: p.name }))}
          placeholder="Pilih periode..."
        />
        {form.periodId && (
          <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-600">
            <span className="font-medium">Nomor Strategi:</span>
            <span className="font-bold text-gray-900">
              {nextNumber !== null ? nextNumber : "—"}
            </span>
            <span className="ml-auto text-xs text-gray-400">(otomatis)</span>
          </div>
        )}
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
