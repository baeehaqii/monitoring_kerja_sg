"use client";
import { useState } from "react";
import { Plus, ChevronDown, ChevronRight, Search, Filter, Pencil } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { KETERANGAN_OPTIONS } from "@/lib/constants";
import { AddStrategyModal } from "./AddStrategyModal";
import { AddProkerModal } from "./AddProkerModal";
import { AddActionPlanModal } from "./AddActionPlanModal";
import { TimelineGrid } from "./TimelineGrid";
import { EditProkerModal } from "./EditProkerModal";
import { EditActionPlanModal } from "./EditActionPlanModal";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { useRouter } from "next/navigation";

type Week = { id: string; label: string; weekNumber: number; periodId: string };
type Period = { id: string; name: string; weeks: Week[] };
type Division = { id: string; name: string };
type ActionPlan = {
  id: string;
  number: number;
  name: string;
  taskTimelines: { weekId: string; week: Week }[];
  weeklyProgress: { status: string }[];
};
type ProgramKerja = {
  id: string;
  number: number;
  name: string;
  targetDate: string | Date | null;
  keterangan: string | null;
  raciAccountable: string | null;
  raciResponsible: string | null;
  raciConsulted: string | null;
  raciInformed: string | null;
  actionPlans: ActionPlan[];
};
type Strategy = {
  id: string;
  number: number;
  name: string;
  division: Division;
  period: Period;
  programKerja: ProgramKerja[];
};

interface Props {
  strategies: Strategy[];
  divisions: Division[];
  periods: Period[];
  userRole: string;
  userDivisionId: string | null;
}

export function ProkerPageClient({ strategies, divisions, periods, userRole, userDivisionId }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filterDivision, setFilterDivision] = useState("");
  const [filterPeriod, setFilterPeriod] = useState("");
  const [expandedStrategies, setExpandedStrategies] = useState<Set<string>>(new Set());
  const [expandedProkers, setExpandedProkers] = useState<Set<string>>(new Set());

  const [addStrategyOpen, setAddStrategyOpen] = useState(false);
  const [addProkerOpen, setAddProkerOpen] = useState<string | null>(null);
  const [addAPOpen, setAddAPOpen] = useState<{ proker: ProgramKerja; strategy: Strategy } | null>(null);
  const [editProkerOpen, setEditProkerOpen] = useState<ProgramKerja | null>(null);
  const [editAPOpen, setEditAPOpen] = useState<{ actionPlan: ActionPlan; strategy: Strategy } | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<{ type: string; id: string; title: string; description: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const isAdmin = ["ADMIN", "SUPER_ADMIN"].includes(userRole);

  const allWeeks = periods.flatMap((p) => p.weeks);

  const filtered = strategies.filter((s) => {
    if (filterDivision && s.division.id !== filterDivision) return false;
    if (filterPeriod && s.period.id !== filterPeriod) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.programKerja.some(
          (pk) =>
            pk.name.toLowerCase().includes(q) ||
            pk.actionPlans.some((ap) => ap.name.toLowerCase().includes(q))
        )
      );
    }
    return true;
  });

  function toggleStrategy(id: string) {
    setExpandedStrategies((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleProker(id: string) {
    setExpandedProkers((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function deleteProker(pk: ProgramKerja) {
    setDeleteTarget({
      type: "proker",
      id: pk.id,
      title: "Hapus Program Kerja?",
      description: `Apakah Anda yakin ingin menghapus program kerja "${pk.name}" beserta seluruh isinya? Data tidak dapat dikembalikan.`,
    });
  }

  function deleteActionPlan(ap: ActionPlan) {
    setDeleteTarget({
      type: "actionPlan",
      id: ap.id,
      title: "Hapus Action Plan?",
      description: `Apakah Anda yakin ingin menghapus action plan "${ap.name}"? Data tidak dapat dikembalikan.`,
    });
  }

  function deleteStrategy(strategy: Strategy) {
    setDeleteTarget({
      type: "strategy",
      id: strategy.id,
      title: "Hapus Strategi?",
      description: `Apakah Anda yakin ingin menghapus strategi "${strategy.name}" beserta semua di dalamnya? Data tidak dapat dikembalikan.`,
    });
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const { type, id } = deleteTarget;
      const url =
        type === "strategy" ? `/api/strategies/${id}`
        : type === "proker" ? `/api/proker/${id}`
        : `/api/action-plans/${id}`;
      await fetch(url, { method: "DELETE" });
      setDeleteTarget(null);
      router.refresh();
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari strategi, program kerja, action plan..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f52ba]/20 focus:border-[#0f52ba] bg-white"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <select
            value={filterDivision}
            onChange={(e) => setFilterDivision(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#0f52ba]/20"
          >
            <option value="">Semua Divisi</option>
            {divisions.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <select
            value={filterPeriod}
            onChange={(e) => setFilterPeriod(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#0f52ba]/20"
          >
            <option value="">Semua Periode</option>
            {periods.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          {isAdmin && (
            <Button onClick={() => setAddStrategyOpen(true)} icon={<Plus className="w-4 h-4" />} size="sm">
              Strategi
            </Button>
          )}
        </div>
      </div>

      {/* Strategies */}
      {filtered.length === 0 ? (
        <Card>
          <p className="text-center text-slate-400 py-10 text-sm">
            {search ? "Tidak ada hasil pencarian." : "Belum ada data Program Kerja."}
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((strategy) => {
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
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{strategy.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {strategy.division.name} · {strategy.period.name} · {strategy.programKerja.length} Program Kerja
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {isAdmin && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => { e.stopPropagation(); setAddProkerOpen(strategy.id); }}
                        icon={<Plus className="w-3 h-3" />}
                      >
                        Program Kerja
                      </Button>
                    )}
                    {isAdmin && (
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteStrategy(strategy); }}
                        className="text-xs text-red-500 hover:text-red-700 px-2 font-medium transition-colors"
                      >
                        Hapus
                      </button>
                    )}
                    {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                  </div>
                </div>

                {/* Program Kerja List */}
                {isExpanded && (
                  <div className="border-t border-slate-200 bg-slate-50 relative">
                    {/* Visual left line connector */}
                    <div className="absolute left-[36px] top-0 bottom-0 w-px bg-slate-200 z-0"></div>

                    {strategy.programKerja.length === 0 ? (
                      <p className="text-sm text-slate-400 text-center py-5 relative z-10">Belum ada Program Kerja</p>
                    ) : (
                      strategy.programKerja.map((pk) => {
                        const pkExpanded = expandedProkers.has(pk.id);
                        const keterangan = KETERANGAN_OPTIONS.find((k) => k.value === pk.keterangan);
                        return (
                          <div key={pk.id} className="border-b border-slate-200 last:border-0 relative z-10 hover:bg-slate-100/50 transition-colors">
                            {/* PK Header */}
                            <div
                              className="flex items-center gap-3 pr-5 pl-12 py-3.5 cursor-pointer transition-colors relative"
                              onClick={() => toggleProker(pk.id)}
                            >
                              <div className="relative">
                                {/* Connector arm from Strategy line */}
                                <div className="absolute right-full top-1/2 w-[12px] h-px bg-slate-300 -translate-y-1/2"></div>
                                <div className="w-7 h-7 rounded-md bg-white border border-slate-200 shadow-sm flex items-center justify-center flex-shrink-0 z-10 relative">
                                  <span className="text-xs font-bold text-slate-700">{pk.number}</span>
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-800 truncate">{pk.name}</p>
                                <div className="flex items-center gap-3 mt-0.5">
                                  {pk.targetDate && (
                                    <span className="text-xs text-slate-400">Target: {formatDate(pk.targetDate)}</span>
                                  )}
                                  {keterangan && (
                                    <span className="text-xs bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded">{keterangan.label}</span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-400">{pk.actionPlans.length} tasks</span>
                                {isAdmin && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={(e) => { e.stopPropagation(); setAddAPOpen({ proker: pk, strategy }); }}
                                    icon={<Plus className="w-3 h-3" />}
                                  />
                                )}
                                {isAdmin && (
                                  <div className="flex items-center gap-1 border-l border-slate-200 pl-2">
                                    <button
                                      onClick={(e) => { e.stopPropagation(); setEditProkerOpen(pk); }}
                                      className="text-slate-400 hover:text-[#0f52ba] p-1 transition-colors"
                                      title="Edit Program Kerja"
                                    >
                                      <Pencil className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={(e) => { e.stopPropagation(); deleteProker(pk); }}
                                      className="text-xs text-red-400 hover:text-red-600 px-1 font-medium transition-colors"
                                    >
                                      Hapus
                                    </button>
                                  </div>
                                )}
                                {pkExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                              </div>
                            </div>

                            {/* Action Plans */}
                            {pkExpanded && (
                              <div className="relative pr-5 pb-4 pl-[88px] bg-slate-100/80 border-t border-slate-200/60 pt-3 shadow-inner">
                                {/* Vertical line dropping from PK badge */}
                                <div className="absolute left-[62px] top-0 bottom-6 w-px bg-slate-300 z-0"></div>

                                {/* RACI Row */}
                                {(pk.raciAccountable || pk.raciResponsible) && (
                                  <div className="flex flex-wrap gap-4 py-2 mb-2 border-b border-slate-100 text-xs">
                                    {pk.raciResponsible && (
                                      <span><span className="font-semibold text-slate-600">R:</span> <span className="text-slate-500">{pk.raciResponsible}</span></span>
                                    )}
                                    {pk.raciAccountable && (
                                      <span><span className="font-semibold text-slate-600">A:</span> <span className="text-slate-500">{pk.raciAccountable}</span></span>
                                    )}
                                    {pk.raciConsulted && (
                                      <span><span className="font-semibold text-slate-600">C:</span> <span className="text-slate-500">{pk.raciConsulted}</span></span>
                                    )}
                                    {pk.raciInformed && (
                                      <span><span className="font-semibold text-slate-600">I:</span> <span className="text-slate-500">{pk.raciInformed}</span></span>
                                    )}
                                  </div>
                                )}

                                {pk.actionPlans.length === 0 ? (
                                  <p className="text-xs text-slate-400 py-3">Belum ada Action Plan</p>
                                ) : (
                                  <div className="space-y-2 py-1">
                                    {pk.actionPlans.map((ap) => {
                                      const status = ap.weeklyProgress?.[0]?.status ?? "NOT_STARTED";
                                      const plannedWeekIds = ap.taskTimelines.map((t) => t.weekId);
                                      return (
                                        <div key={ap.id} className="relative z-10 flex items-center gap-3 py-2 px-3 rounded-lg bg-white border border-slate-200 shadow-sm hover:border-slate-300 transition-colors group">
                                          {/* Connector arm from PK line */}
                                          <div className="absolute right-full top-1/2 w-[26px] h-px bg-slate-300 -translate-y-1/2"></div>
                                          <div className="w-6 h-6 rounded bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0">
                                            <span className="text-xs font-semibold text-slate-500">{ap.number}</span>
                                          </div>
                                          <span className="flex-1 text-sm font-medium text-slate-700 truncate">{ap.name}</span>
                                          <TimelineGrid
                                            allWeeks={allWeeks}
                                            plannedWeekIds={plannedWeekIds}
                                            periodId={strategy.period.id}
                                          />
                                          <StatusBadge status={status} />
                                          {isAdmin && (
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pl-2 border-l border-slate-200">
                                              <button
                                                onClick={() => setEditAPOpen({ actionPlan: ap, strategy })}
                                                className="text-slate-400 hover:text-[#0f52ba] p-1 transition-colors"
                                                title="Edit Action Plan"
                                              >
                                                <Pencil className="w-3.5 h-3.5" />
                                              </button>
                                              <button
                                                onClick={() => deleteActionPlan(ap)}
                                                className="text-slate-400 hover:text-red-600 p-1 font-bold text-sm transition-colors"
                                                title="Hapus Action Plan"
                                              >
                                                ×
                                              </button>
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <AddStrategyModal
        open={addStrategyOpen}
        onClose={() => setAddStrategyOpen(false)}
        divisions={divisions}
        periods={periods}
        onSuccess={() => router.refresh()}
      />
      {addProkerOpen && (
        <AddProkerModal
          open={!!addProkerOpen}
          onClose={() => setAddProkerOpen(null)}
          strategyId={addProkerOpen}
          onSuccess={() => { setAddProkerOpen(null); router.refresh(); }}
        />
      )}
      {addAPOpen && (
        <AddActionPlanModal
          open={!!addAPOpen}
          onClose={() => setAddAPOpen(null)}
          programKerja={addAPOpen.proker}
          allWeeks={addAPOpen.strategy.period.weeks}
          onSuccess={() => { setAddAPOpen(null); router.refresh(); }}
        />
      )}
      {editProkerOpen && (
        <EditProkerModal
          open={!!editProkerOpen}
          onClose={() => setEditProkerOpen(null)}
          programKerja={editProkerOpen}
          onSuccess={() => { setEditProkerOpen(null); router.refresh(); }}
        />
      )}
      {editAPOpen && (
        <EditActionPlanModal
          open={!!editAPOpen}
          onClose={() => setEditAPOpen(null)}
          actionPlan={editAPOpen.actionPlan}
          allWeeks={editAPOpen.strategy.period.weeks}
          onSuccess={() => { setEditAPOpen(null); router.refresh(); }}
        />
      )}
      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => !isDeleting && setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title={deleteTarget?.title || ""}
        description={deleteTarget?.description || ""}
        isLoading={isDeleting}
      />
    </div>
  );
}
