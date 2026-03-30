"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { formatDate } from "@/lib/utils";
import {
  ClipboardList,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ListTodo,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  Activity,
  Filter,
} from "lucide-react";
import Link from "next/link";

// Custom hook for counting animation
function useCountUp(end: number, duration: number = 800) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // use ease-out quad
      const easeOut = 1 - (1 - progress) * (1 - progress);
      setCount(Math.floor(easeOut * end));

      if (progress < 1) {
        animationFrameId = window.requestAnimationFrame(step);
      } else {
        setCount(end);
      }
    };

    animationFrameId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(animationFrameId);
  }, [end, duration]);

  return count;
}

const STATUS_CONFIG = {
  DONE: {
    bg: "bg-success/10",
    icon: "text-success",
    badge: "bg-success-light text-success",
    label: "Selesai",
  },
  ON_PROGRESS: {
    bg: "bg-primary/10",
    icon: "text-primary",
    badge: "bg-primary/10 text-primary",
    label: "On Progress",
  },
  DELAY: {
    bg: "bg-error/10",
    icon: "text-error",
    badge: "bg-error-light text-error",
    label: "Terlambat",
  },
  NOT_STARTED: {
    bg: "bg-muted",
    icon: "text-secondary",
    badge: "bg-muted text-secondary",
    label: "Belum Mulai",
  },
} as const;

type DashboardData = {
  totalActionPlans: number;
  done: number;
  onProgress: number;
  notStarted: number;
  delay: number;
  total: number;
  recentProgress: any[];
  delayedTasks: any[];
  divisionStats: any[];
  isAdmin: boolean;
};

interface Props {
  data: DashboardData;
  divisions: { id: string; name: string }[];
  userName: string;
  userDivisionName?: string | null;
}

export function DashboardClient({ data, divisions, userName, userDivisionName }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [animKey, setAnimKey] = useState(0);

  const currentDiv = searchParams.get("div") || "";
  const currentDate = searchParams.get("date") || "";

  // Update animation key when data changes to trigger re-animation
  useEffect(() => {
    setAnimKey((prev) => prev + 1);
  }, [data.totalActionPlans, data.total]);

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/?${params.toString()}`);
  };

  const completionRate = data.total > 0 ? Math.round((data.done / data.total) * 100) : 0;
  const safeTotal = Math.max(data.total, 1);

  const doneP = (data.done / safeTotal) * 100;
  const onProgressP = (data.onProgress / safeTotal) * 100;
  const delayP = (data.delay / safeTotal) * 100;

  // Animated counters
  const actTotalPlans = useCountUp(data.totalActionPlans);
  const actDone = useCountUp(data.done);
  const actOnProgress = useCountUp(data.onProgress);
  const actNotStarted = useCountUp(data.notStarted);
  const actDelay = useCountUp(data.delay);

  return (
    <div className="flex flex-col gap-6">
      <Header
        title="Dashboard"
        subtitle={`Selamat datang, ${userName}${
          userDivisionName ? ` · Divisi ${userDivisionName}` : " · Semua Divisi"
        }`}
        action={
          <div className="flex justify-end items-center gap-3">
            <Filter className="w-4 h-4 text-slate-400" />
            {data.isAdmin && (
              <select
                value={currentDiv}
                onChange={(e) => handleFilterChange("div", e.target.value)}
                className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#0f52ba]/20 transition-all font-medium text-slate-700"
              >
                <option value="">Semua Divisi</option>
                {divisions.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            )}
            <select
              value={currentDate}
              onChange={(e) => handleFilterChange("date", e.target.value)}
              className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#0f52ba]/20 transition-all font-medium text-slate-700"
            >
              <option value="">Semua Waktu</option>
              <option value="today">Hari Ini</option>
              <option value="7days">7 Hari Terakhir</option>
              <option value="month">Bulan Ini</option>
              <option value="lastMonth">Bulan Lalu</option>
            </select>
          </div>
        }
      />

      <div key={animKey} className="flex flex-col gap-6">
        {/* ── Stat Cards ─────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Total Task */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col rounded-2xl border border-border p-5 gap-3 bg-white hover:ring-1 hover:ring-primary transition-all cursor-default">
          <div className="flex items-center gap-2">
            <div className="size-11 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
              <ClipboardList className="size-[22px] text-primary" />
            </div>
            <p className="font-medium text-secondary text-sm leading-tight">Total Task</p>
          </div>
          <div className="flex items-end justify-between gap-2">
            <p className="font-bold text-[28px] leading-8 text-foreground transition-all">
              {actTotalPlans}
            </p>
            <span className="flex items-center text-primary text-[11px] font-bold bg-primary/10 px-2 py-1 rounded-full mb-1 shrink-0">
              Action Plan
            </span>
          </div>
        </div>

        {/* Selesai */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-75 flex flex-col rounded-2xl border border-border p-5 gap-3 bg-white hover:ring-1 hover:ring-success transition-all cursor-default">
          <div className="flex items-center gap-2">
            <div className="size-11 bg-success/10 rounded-xl flex items-center justify-center shrink-0">
              <CheckCircle2 className="size-[22px] text-success" />
            </div>
            <p className="font-medium text-secondary text-sm leading-tight">Selesai</p>
          </div>
          <div className="flex items-end justify-between gap-2">
            <p className="font-bold text-[28px] leading-8 text-foreground transition-all">
              {actDone}
            </p>
            <span className="flex items-center text-success text-[11px] font-bold bg-success-light px-2 py-1 rounded-full mb-1 shrink-0 transition-opacity">
              {data.total > 0 ? Math.round((data.done / data.total) * 100) : 0}%
            </span>
          </div>
        </div>

        {/* On Progress */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150 flex flex-col rounded-2xl border border-border p-5 gap-3 bg-white hover:ring-1 hover:ring-primary transition-all cursor-default">
          <div className="flex items-center gap-2">
            <div className="size-11 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
              <Clock className="size-[22px] text-primary" />
            </div>
            <p className="font-medium text-secondary text-sm leading-tight">On Progress</p>
          </div>
          <div className="flex items-end justify-between gap-2">
            <p className="font-bold text-[28px] leading-8 text-foreground transition-all">
              {actOnProgress}
            </p>
            <span className="flex items-center text-primary text-[11px] font-bold bg-primary/10 px-2 py-1 rounded-full mb-1 shrink-0">
              {data.total > 0 ? Math.round((data.onProgress / data.total) * 100) : 0}%
            </span>
          </div>
        </div>

        {/* Belum Mulai */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200 flex flex-col rounded-2xl border border-border p-5 gap-3 bg-white hover:ring-1 hover:ring-secondary transition-all cursor-default">
          <div className="flex items-center gap-2">
            <div className="size-11 bg-muted rounded-xl flex items-center justify-center shrink-0">
              <ListTodo className="size-[22px] text-secondary" />
            </div>
            <p className="font-medium text-secondary text-sm leading-tight">Belum Mulai</p>
          </div>
          <div className="flex items-end justify-between gap-2">
            <p className="font-bold text-[28px] leading-8 text-foreground transition-all">
              {actNotStarted}
            </p>
            <span className="flex items-center text-secondary text-[11px] font-medium bg-muted px-2 py-1 rounded-full mb-1 shrink-0">
              {data.total > 0 ? Math.round((data.notStarted / data.total) * 100) : 0}%
            </span>
          </div>
        </div>

        {/* Delay / Melebihi SLA */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300 flex flex-col rounded-2xl border border-border p-5 gap-3 bg-white hover:ring-1 hover:ring-error transition-all cursor-default">
          <div className="flex items-center gap-2">
            <div className="size-11 bg-error/10 rounded-xl flex items-center justify-center shrink-0">
              <AlertTriangle className="size-[22px] text-error" />
            </div>
            <p className="font-medium text-secondary text-sm leading-tight">Melebihi SLA</p>
          </div>
          <div className="flex items-end justify-between gap-2">
            <p className="font-bold text-[28px] leading-8 text-foreground transition-all">
              {actDelay}
            </p>
            <span className="flex items-center text-error text-[11px] font-bold bg-error-light px-2 py-1 rounded-full mb-1 shrink-0">
              Delay
            </span>
          </div>
        </div>
      </div>

      {/* ── Middle Row: Division Progress + Completion Ring ─────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
        <div className="lg:col-span-2 flex flex-col rounded-2xl border border-border p-6 gap-5 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg text-foreground">
                {data.isAdmin ? "Progress per Divisi" : "Ringkasan Progress"}
              </h3>
              <p className="text-sm text-secondary">
                {data.isAdmin ? "Distribusi status task tiap divisi" : "Status distribusi task divisi Anda"}
              </p>
            </div>
            <Link href="/proker" className="text-sm text-red-600 font-semibold hover:underline flex items-center gap-1">
              Detail <ArrowRight className="size-3.5" />
            </Link>
          </div>

          <div className="flex flex-col gap-5">
            {data.divisionStats.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 gap-2">
                <div className="size-12 bg-muted rounded-full flex items-center justify-center">
                  <Activity className="size-6 text-secondary" />
                </div>
                <p className="text-sm text-secondary">Belum ada data task</p>
              </div>
            ) : (
              data.divisionStats.map((div) => {
                const rate = div.total > 0 ? Math.round((div.done / div.total) * 100) : 0;
                const doneW = div.total > 0 ? (div.done / div.total) * 100 : 0;
                const onProgressW = div.total > 0 ? (div.onProgress / div.total) * 100 : 0;
                const delayW = div.total > 0 ? (div.delay / div.total) * 100 : 0;
                const notStartedW = div.total > 0 ? (div.notStarted / div.total) * 100 : 0;

                return (
                  <div key={div.id} className="flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-sm text-foreground truncate">{div.name}</p>
                      <div className="flex items-center gap-3 shrink-0">
                         <span className="text-xs text-secondary">{div.total} task</span>
                         <span className={`text-xs font-bold ${rate >= 75 ? "text-success" : rate >= 40 ? "text-primary" : "text-error"}`}>{rate}%</span>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden flex">
                      <div className="h-full bg-success transition-all duration-1000 ease-out" style={{ width: `${doneW}%` }} title={`Done: ${div.done}`} />
                      <div className="h-full bg-primary transition-all duration-1000 ease-out delay-75" style={{ width: `${onProgressW}%` }} title={`On Progress: ${div.onProgress}`} />
                      <div className="h-full bg-error transition-all duration-1000 ease-out delay-150" style={{ width: `${delayW}%` }} title={`Delay: ${div.delay}`} />
                      <div className="h-full bg-border transition-all duration-1000 ease-out delay-200" style={{ width: `${notStartedW}%` }} title={`Belum Mulai: ${div.notStarted}`} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Completion Ring */}
        <div className="flex flex-col rounded-2xl border border-border p-6 gap-4 bg-white">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg text-foreground">Tingkat Selesai</h3>
            <div className="size-9 bg-primary/10 rounded-xl flex items-center justify-center">
               <TrendingUp className="size-[18px] text-primary" />
            </div>
          </div>
          <div className="flex flex-col items-center justify-center py-3">
            <div
              className="size-[144px] rounded-full flex items-center justify-center transition-all duration-1000 ease-in-out"
              style={{
                background: `conic-gradient(
                  #30B22D 0% ${doneP}%,
                  #165DFF ${doneP}% ${doneP + onProgressP}%,
                  #ED6B60 ${doneP + onProgressP}% ${doneP + onProgressP + delayP}%,
                  #EFF2F7 ${doneP + onProgressP + delayP}% 100%
                )`,
              }}
            >
              <div className="size-[96px] rounded-full bg-white flex flex-col items-center justify-center gap-0.5">
                 <p className="font-bold text-2xl text-foreground leading-none">{completionRate}%</p>
                 <p className="text-[10px] text-secondary">Selesai</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
            {[
              { label: "Done", value: data.done, color: "bg-success" },
              { label: "Progress", value: data.onProgress, color: "bg-primary" },
              { label: "Delay", value: data.delay, color: "bg-error" },
              { label: "Belum", value: data.notStarted, color: "bg-secondary/20" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <span className={`size-2.5 rounded-full ${item.color} shrink-0`} />
                <span className="text-xs text-secondary">
                  {item.label} <span className="font-semibold text-foreground">({useCountUp(item.value)})</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom Row: Recent Activities + Delayed Tasks ───────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
        {/* Recent Activities */}
        <div className="lg:col-span-2 flex flex-col rounded-2xl border border-border p-6 bg-white">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg text-foreground">Aktivitas Terbaru</h3>
            <Link href="/weekly" className="text-sm text-red-600 font-semibold hover:underline flex items-center gap-1">
              Lihat Semua <ArrowRight className="size-3.5" />
            </Link>
          </div>
          <div className="flex flex-col">
            {data.recentProgress.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <div className="size-12 bg-muted rounded-full flex items-center justify-center">
                  <Activity className="size-6 text-secondary" />
                </div>
                <p className="text-sm text-secondary">Belum ada aktivitas progress</p>
              </div>
            ) : (
              data.recentProgress.map((p) => {
                const cfg = STATUS_CONFIG[p.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.NOT_STARTED;
                return (
                  <div key={p.id} className="flex items-start gap-4 py-4 border-b border-border hover:bg-muted/40 -mx-2 px-2 rounded-xl transition-all duration-200 last:border-0 hover:translate-x-1">
                    <div className={`size-11 rounded-full ${cfg.bg} flex items-center justify-center shrink-0 ring-1 ring-border`}>
                      <CheckCircle2 className={`size-5 ${cfg.icon}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <p className="font-semibold text-foreground text-sm truncate">{p.actionPlan.name}</p>
                        <span className="text-xs text-secondary shrink-0">{formatDate(p.updatedAt)}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${cfg.badge}`}>{cfg.label}</span>
                        <p className="text-xs text-secondary truncate">
                          {p.actionPlan.programKerja.strategy.division.name} · {p.week.label}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Task Delay */}
        <div className="flex flex-col rounded-2xl border border-error/25 p-6 gap-5 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="size-9 bg-error/10 rounded-xl flex items-center justify-center shrink-0">
                <AlertCircle className="size-[18px] text-error" />
              </div>
              <h3 className="font-bold text-base text-foreground">Task Delay</h3>
            </div>
            {data.delay > 0 && <span className="text-[11px] font-bold text-error bg-error-light px-2.5 py-1 rounded-full">{data.delay} task</span>}
          </div>
          <div className="flex flex-col gap-4 flex-1">
            {data.delayedTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center flex-1 py-6 gap-2">
                <div className="size-12 bg-success/10 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="size-6 text-success" />
                </div>
                <p className="text-sm font-semibold text-foreground">Tidak ada delay!</p>
                <p className="text-xs text-secondary text-center">Semua task berjalan sesuai SLA</p>
              </div>
            ) : (
              data.delayedTasks.map((t) => {
                const targetDate = t.actionPlan.programKerja.targetDate;
                let overdueLabel = "";
                if (targetDate) {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const target = new Date(targetDate);
                  target.setHours(0, 0, 0, 0);
                  const diffDays = Math.round((today.getTime() - target.getTime()) / (1000 * 60 * 60 * 24));
                  if (diffDays > 0) overdueLabel = `+${diffDays}h terlambat`;
                  else if (diffDays === 0) overdueLabel = "Deadline hari ini";
                }
                return (
                  <div key={t.id} className="flex flex-col gap-1.5 pb-4 border-b border-border last:border-0 last:pb-0">
                    <p className="font-semibold text-sm text-foreground line-clamp-2">{t.actionPlan.name}</p>
                    <p className="text-xs text-secondary truncate">{t.actionPlan.programKerja.strategy.division.name} · {t.actionPlan.programKerja.name}</p>
                    {overdueLabel && <span className="self-start text-[10px] font-bold text-error bg-error-light px-2 py-0.5 rounded-full">{overdueLabel}</span>}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
