"use client";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Textarea, Select } from "@/components/ui/Input";
import { StatusBadge } from "@/components/ui/Badge";
import {
  ChevronLeft, ChevronRight, Save, CheckCircle2,
  ChevronDown, ChevronRight as ChevronRightIcon,
} from "lucide-react";
import { TASK_STATUSES } from "@/lib/constants";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Week = { id: string; weekNumber: number; label: string; period: { id: string; name: string } };

type ProgressEntry = {
  currentProgress?: string;
  nextStep?: string;
  status: string;
};

type ActionPlan = {
  id: string;
  number: number;
  name: string;
  taskTimelines: { weekId: string }[];
  weeklyProgress: {
    currentProgress: string | null;
    nextStep: string | null;
    status: string;
  }[];
};

type ProgramKerja = {
  id: string;
  number: number;
  name: string;
  actionPlans: ActionPlan[];
};

type Strategy = {
  id: string;
  number: number;
  name: string;
  division: { name: string };
  programKerja: ProgramKerja[];
};

interface Props {
  week: Week;
  nextWeek: Week | null;
  prevWeek: Week | null;
  strategies: Strategy[];
  userRole: string;
}

export function WeeklyProgressClient({ week, nextWeek, prevWeek, strategies, userRole }: Props) {
  const router = useRouter();

  // Initialize progress state from existing data
  const [progressMap, setProgressMap] = useState<Record<string, ProgressEntry>>(() => {
    const map: Record<string, ProgressEntry> = {};
    for (const s of strategies) {
      for (const pk of s.programKerja) {
        for (const ap of pk.actionPlans) {
          const existing = ap.weeklyProgress[0];
          map[ap.id] = {
            currentProgress: existing?.currentProgress ?? "",
            nextStep: existing?.nextStep ?? "",
            status: existing?.status ?? "NOT_STARTED",
          };
        }
      }
    }
    return map;
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [expandedStrategies, setExpandedStrategies] = useState<Set<string>>(
    new Set(strategies.map((s) => s.id))
  );

  function toggleStrategy(id: string) {
    setExpandedStrategies((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const updateProgress = useCallback(
    (apId: string, field: keyof ProgressEntry, value: string) => {
      setProgressMap((prev) => ({
        ...prev,
        [apId]: { ...prev[apId], [field]: value },
      }));
      setSaved(false);
    },
    []
  );

  async function handleSave() {
    setSaving(true);
    const updates = Object.entries(progressMap).map(([actionPlanId, p]) => ({
      actionPlanId,
      currentProgress: p.currentProgress,
      nextStep: p.nextStep,
      status: p.status,
    }));

    const res = await fetch(`/api/weekly/${week.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });

    setSaving(false);
    if (res.ok) {
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 3000);
    }
  }

  const allActionPlans = strategies.flatMap((s) =>
    s.programKerja.flatMap((pk) => pk.actionPlans)
  );
  const doneCount = allActionPlans.filter((ap) => progressMap[ap.id]?.status === "DONE").length;
  const totalCount = allActionPlans.length;

  return (
    <div>
      {/* Navigation Bar */}
      <div className="flex items-center justify-between mb-5 bg-white rounded-xl border border-slate-200 px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2">
          {prevWeek ? (
            <Link href={`/weekly/${prevWeek.id}`}>
              <Button variant="outline" size="sm" icon={<ChevronLeft className="w-4 h-4" />}>
                W{prevWeek.weekNumber}
              </Button>
            </Link>
          ) : (
            <Button variant="outline" size="sm" disabled icon={<ChevronLeft className="w-4 h-4" />}>Prev</Button>
          )}
        </div>

        <div className="text-center">
          <p className="text-sm font-semibold text-slate-900">Week {week.weekNumber} — {week.period.name}</p>
          <p className="text-xs text-slate-400">{week.label}</p>
        </div>

        <div className="flex items-center gap-2">
          {nextWeek ? (
            <Link href={`/weekly/${nextWeek.id}`}>
              <Button variant="outline" size="sm" icon={<ChevronRight className="w-4 h-4" />}>
                W{nextWeek.weekNumber}
              </Button>
            </Link>
          ) : (
            <Button variant="outline" size="sm" disabled>Next</Button>
          )}
        </div>
      </div>

      {/* Progress Summary */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex-1 bg-white rounded-xl border border-slate-200 px-4 py-3 flex items-center gap-3">
          <CheckCircle2 className="w-4 h-4 text-green-500" />
          <span className="text-sm text-slate-600">
            <span className="font-bold text-slate-900">{doneCount}</span> / {totalCount} task selesai
          </span>
          <div className="flex-1 bg-slate-100 rounded-full h-1.5">
            <div
              className="bg-green-500 h-1.5 rounded-full transition-all"
              style={{ width: `${totalCount > 0 ? (doneCount / totalCount) * 100 : 0}%` }}
            />
          </div>
        </div>
        <Button
          onClick={handleSave}
          loading={saving}
          icon={saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          className={cn(saved && "bg-green-600 hover:bg-green-700")}
        >
          {saved ? "Tersimpan!" : "Simpan Progress"}
        </Button>
      </div>

      {/* Strategy + PK + AP List */}
      {strategies.length === 0 ? (
        <Card>
          <p className="text-center text-slate-400 py-10 text-sm">Belum ada data program kerja.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {strategies.map((strategy) => {
            const isExpanded = expandedStrategies.has(strategy.id);
            return (
              <Card key={strategy.id} padding={false} className="border-l-[5px] border-l-red-600 shadow-md hover:shadow-lg transition-shadow bg-white overflow-hidden">
                {/* Strategy Header */}
                <div
                  className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => toggleStrategy(strategy.id)}
                >
                  <div className="w-8 h-8 rounded-lg bg-red-100/80 flex items-center justify-center flex-shrink-0 ring-1 ring-red-200">
                    <span className="text-sm font-bold text-red-600">{strategy.number}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-900">{strategy.name}</p>
                    <p className="text-xs text-slate-400">{strategy.division.name}</p>
                  </div>
                  {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRightIcon className="w-4 h-4 text-slate-400" />}
                </div>

                {isExpanded && (
                  <div className="border-t border-slate-200 bg-slate-50 relative">
                    {/* Visual left line connector */}
                    <div className="absolute left-[36px] top-0 bottom-0 w-px bg-slate-200 z-0"></div>

                    {strategy.programKerja.map((pk) => (
                      <div key={pk.id} className="border-b border-slate-200 last:border-0 relative z-10 transition-colors hover:bg-slate-100/50">
                        {/* PK Header */}
                        <div className="flex items-center gap-3 pr-5 pl-12 py-3.5 cursor-pointer transition-colors relative">
                          <div className="relative">
                            {/* Connector arm from Strategy line */}
                            <div className="absolute right-full top-1/2 w-[12px] h-px bg-slate-300 -translate-y-1/2"></div>
                            <div className="w-7 h-7 rounded-md bg-white border border-slate-200 shadow-sm flex items-center justify-center flex-shrink-0 z-10 relative">
                              <span className="text-xs font-bold text-slate-700">{pk.number}</span>
                            </div>
                          </div>
                          <span className="text-sm font-medium text-slate-800">{pk.name}</span>
                        </div>

                        {/* Action Plans */}
                        <div className="relative pr-5 pb-5 pl-[88px] bg-slate-100/80 border-t border-slate-200/60 pt-4 shadow-inner">
                          {/* Vertical line dropping from PK badge */}
                          <div className="absolute left-[62px] top-0 bottom-8 w-px bg-slate-300 z-0"></div>

                          {pk.actionPlans.map((ap) => {
                            const prog = progressMap[ap.id] ?? { currentProgress: "", nextStep: "", status: "NOT_STARTED" };
                            const isPlanned = ap.taskTimelines.length > 0;

                            return (
                              <div
                                key={ap.id}
                                className={cn(
                                  "relative z-10 px-5 py-5 mb-4 border border-slate-200 rounded-xl bg-white shadow-sm transition-colors",
                                  !isPlanned && "opacity-60"
                                )}
                              >
                                {/* Connector arm from PK line */}
                                <div className="absolute right-full top-[32px] w-[26px] h-px bg-slate-300 -translate-y-1/2"></div>

                                <div className="flex items-center gap-3 mb-4">
                                  <div className="w-6 h-6 rounded bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0">
                                    <span className="text-xs font-semibold text-slate-500">{ap.number}</span>
                                  </div>
                                  <span className="text-sm font-medium text-slate-800 flex-1">{ap.name}</span>
                                  {!isPlanned && (
                                    <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                                      Tidak dijadwalkan minggu ini
                                    </span>
                                  )}
                                  <StatusBadge status={prog.status} />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                  <Textarea
                                    label={`Current Progress W${week.weekNumber}`}
                                    placeholder="Apa yang sudah dikerjakan minggu ini..."
                                    value={prog.currentProgress ?? ""}
                                    onChange={(e) => updateProgress(ap.id, "currentProgress", e.target.value)}
                                    rows={2}
                                  />
                                  <Textarea
                                    label={`Next Step W${(week.weekNumber % 5) + 1}`}
                                    placeholder="Rencana untuk minggu depan..."
                                    value={prog.nextStep ?? ""}
                                    onChange={(e) => updateProgress(ap.id, "nextStep", e.target.value)}
                                    rows={2}
                                  />
                                  <Select
                                    label="Status"
                                    value={prog.status}
                                    onChange={(e) => updateProgress(ap.id, "status", e.target.value)}
                                    options={TASK_STATUSES.map((s) => ({ value: s.value, label: `${s.label} — ${s.labelId}` }))}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Fixed Save Button */}
      <div className="fixed bottom-6 right-6">
        <Button
          onClick={handleSave}
          loading={saving}
          size="lg"
          icon={saved ? <CheckCircle2 className="w-5 h-5" /> : <Save className="w-5 h-5" />}
          className={cn(
            "shadow-lg",
            saved && "bg-green-600 hover:bg-green-700"
          )}
        >
          {saved ? "Tersimpan!" : "Simpan Progress"}
        </Button>
      </div>
    </div>
  );
}
