"use client";
import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

type Week = { id: string; label: string; weekNumber: number };

interface Props {
  open: boolean;
  onClose: () => void;
  programKerja: { id: string; name: string; actionPlans: { number: number }[] };
  allWeeks: Week[];
  onSuccess: () => void;
}

export function AddActionPlanModal({ open, onClose, programKerja, allWeeks, onSuccess }: Props) {
  const nextNum = (programKerja.actionPlans.length > 0
    ? Math.max(...programKerja.actionPlans.map((a) => a.number)) + 1
    : 1);

  const [name, setName] = useState("");
  const [selectedWeeks, setSelectedWeeks] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleWeek(weekId: string) {
    setSelectedWeeks((prev) => {
      const next = new Set(prev);
      next.has(weekId) ? next.delete(weekId) : next.add(weekId);
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/action-plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        programKerjaId: programKerja.id,
        number: nextNum,
        name,
        plannedWeekIds: Array.from(selectedWeeks),
      }),
    });

    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Terjadi kesalahan");
      return;
    }

    setName("");
    setSelectedWeeks(new Set());
    onSuccess();
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="Tambah Action Plan" size="lg">
      <p className="text-xs text-slate-500 mb-4">
        Program Kerja: <span className="font-medium text-slate-700">{programKerja.name}</span>
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label={`Nama Action Plan #${nextNum}`}
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Deskripsi action plan..."
        />

        {allWeeks.length > 0 && (
          <div>
            <p className="text-sm font-medium text-slate-700 mb-2">Timeline (pilih minggu yang direncanakan)</p>
            <div className="flex flex-wrap gap-2">
              {allWeeks.map((w) => {
                const sel = selectedWeeks.has(w.id);
                return (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => toggleWeek(w.id)}
                    className={`px-3 py-1.5 text-xs rounded-lg border transition-all ${
                      sel
                        ? "bg-[#0f52ba] text-white border-[#0f52ba]"
                        : "bg-white text-slate-600 border-slate-200 hover:border-[#0f52ba] hover:text-[#0f52ba]"
                    }`}
                  >
                    W{w.weekNumber}
                  </button>
                );
              })}
            </div>
            {selectedWeeks.size > 0 && (
              <p className="text-xs text-slate-400 mt-1">{selectedWeeks.size} minggu dipilih</p>
            )}
          </div>
        )}

        {error && <p className="text-xs text-red-500">{error}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>Batal</Button>
          <Button type="submit" loading={loading}>Simpan</Button>
        </div>
      </form>
    </Modal>
  );
}
