"use client";
import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

type Week = { id: string; label: string; weekNumber: number };

interface Props {
  open: boolean;
  onClose: () => void;
  actionPlan: any;
  allWeeks: Week[];
  onSuccess: () => void;
}

export function EditActionPlanModal({ open, onClose, actionPlan, allWeeks, onSuccess }: Props) {
  const [name, setName] = useState("");
  const [selectedWeeks, setSelectedWeeks] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (actionPlan && open) {
      setName(actionPlan.name || "");
      const currentWeeks = new Set<string>();
      if (actionPlan.taskTimelines && Array.isArray(actionPlan.taskTimelines)) {
        actionPlan.taskTimelines.forEach((t: any) => {
          if (t.weekId) currentWeeks.add(t.weekId);
        });
      }
      setSelectedWeeks(currentWeeks);
      setError(null);
    }
  }, [actionPlan, open]);

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

    const res = await fetch(`/api/action-plans/${actionPlan.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
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

    onSuccess();
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={`Edit Action Plan #${actionPlan?.number}`} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nama Action Plan"
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
