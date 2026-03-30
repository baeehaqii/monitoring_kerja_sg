import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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
} from "lucide-react";
import Link from "next/link";

async function getDashboardData(divisionId: string | null, role: string) {
  const isAdmin = role === "ADMIN" || role === "SUPER_ADMIN";
  const apWhere =
    !isAdmin && divisionId
      ? { programKerja: { strategy: { divisionId } } }
      : {};

  const [totalActionPlans, statusCounts, recentProgress, delayedTasks, allAPs] =
    await Promise.all([
      prisma.actionPlan.count({ where: apWhere }),

      prisma.weeklyProgress.groupBy({
        by: ["status"],
        _count: { status: true },
        where: { actionPlan: apWhere },
      }),

      prisma.weeklyProgress.findMany({
        where: { actionPlan: apWhere },
        orderBy: { updatedAt: "desc" },
        take: 6,
        select: {
          id: true,
          status: true,
          updatedAt: true,
          currentProgress: true,
          actionPlan: {
            select: {
              name: true,
              programKerja: {
                select: {
                  name: true,
                  strategy: {
                    select: { division: { select: { name: true } } },
                  },
                },
              },
            },
          },
          week: { select: { label: true } },
        },
      }),

      prisma.weeklyProgress.findMany({
        where: { status: "DELAY", actionPlan: apWhere },
        orderBy: { updatedAt: "desc" },
        take: 5,
        select: {
          id: true,
          updatedAt: true,
          actionPlan: {
            select: {
              name: true,
              programKerja: {
                select: {
                  name: true,
                  targetDate: true,
                  strategy: {
                    select: { division: { select: { name: true } } },
                  },
                },
              },
            },
          },
        },
      }),

      prisma.actionPlan.findMany({
        where: apWhere,
        select: {
          weeklyProgress: {
            select: { status: true },
            orderBy: { updatedAt: "desc" },
            take: 1,
          },
          programKerja: {
            select: {
              strategy: {
                select: {
                  division: { select: { id: true, name: true } },
                },
              },
            },
          },
        },
      }),
    ]);

  const statusMap: Record<string, number> = {};
  for (const s of statusCounts) {
    statusMap[s.status] = s._count.status;
  }

  const done = statusMap["DONE"] ?? 0;
  const onProgress = statusMap["ON_PROGRESS"] ?? 0;
  const notStarted = statusMap["NOT_STARTED"] ?? 0;
  const delay = statusMap["DELAY"] ?? 0;
  const total = done + onProgress + notStarted + delay;

  // Aggregate per division from action plans
  type DivStats = {
    id: string;
    name: string;
    done: number;
    onProgress: number;
    delay: number;
    notStarted: number;
    total: number;
  };
  const divMap = new Map<string, DivStats>();
  for (const ap of allAPs) {
    const div = ap.programKerja.strategy.division;
    if (!divMap.has(div.id)) {
      divMap.set(div.id, {
        id: div.id,
        name: div.name,
        done: 0,
        onProgress: 0,
        delay: 0,
        notStarted: 0,
        total: 0,
      });
    }
    const ds = divMap.get(div.id)!;
    const st = ap.weeklyProgress[0]?.status ?? "NOT_STARTED";
    ds.total++;
    if (st === "DONE") ds.done++;
    else if (st === "ON_PROGRESS") ds.onProgress++;
    else if (st === "DELAY") ds.delay++;
    else ds.notStarted++;
  }

  const divisionStats = Array.from(divMap.values()).sort(
    (a, b) => b.total - a.total
  );

  return {
    totalActionPlans,
    done,
    onProgress,
    notStarted,
    delay,
    total,
    recentProgress,
    delayedTasks,
    divisionStats,
    isAdmin,
  };
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

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) return null;

  const {
    totalActionPlans,
    done,
    onProgress,
    notStarted,
    delay,
    total,
    recentProgress,
    delayedTasks,
    divisionStats,
    isAdmin,
  } = await getDashboardData(session.user.divisionId, session.user.role);

  const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;
  const safeTotal = Math.max(total, 1);

  const doneP = (done / safeTotal) * 100;
  const onProgressP = (onProgress / safeTotal) * 100;
  const delayP = (delay / safeTotal) * 100;

  return (
    <div className="flex flex-col gap-6">
      <Header
        title="Dashboard"
        subtitle={`Selamat datang, ${session.user.name}${
          session.user.divisionName
            ? ` · Divisi ${session.user.divisionName}`
            : " · Semua Divisi"
        }`}
      />

      {/* ── Stat Cards ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Task */}
        <div className="flex flex-col rounded-2xl border border-border p-5 gap-3 bg-white hover:ring-1 hover:ring-primary transition-all duration-300 cursor-default">
          <div className="flex items-center gap-2">
            <div className="size-11 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
              <ClipboardList className="size-[22px] text-primary" />
            </div>
            <p className="font-medium text-secondary text-sm leading-tight">
              Total Task
            </p>
          </div>
          <div className="flex items-end justify-between gap-2">
            <p className="font-bold text-[28px] leading-8 text-foreground">
              {totalActionPlans}
            </p>
            <span className="flex items-center text-primary text-[11px] font-bold bg-primary/10 px-2 py-1 rounded-full mb-1 shrink-0">
              Action Plan
            </span>
          </div>
        </div>

        {/* Selesai */}
        <div className="flex flex-col rounded-2xl border border-border p-5 gap-3 bg-white hover:ring-1 hover:ring-primary transition-all duration-300 cursor-default">
          <div className="flex items-center gap-2">
            <div className="size-11 bg-success/10 rounded-xl flex items-center justify-center shrink-0">
              <CheckCircle2 className="size-[22px] text-success" />
            </div>
            <p className="font-medium text-secondary text-sm leading-tight">
              Selesai
            </p>
          </div>
          <div className="flex items-end justify-between gap-2">
            <p className="font-bold text-[28px] leading-8 text-foreground">
              {done}
            </p>
            <span className="flex items-center text-success text-[11px] font-bold bg-success-light px-2 py-1 rounded-full mb-1 shrink-0">
              {total > 0 ? Math.round((done / total) * 100) : 0}%
            </span>
          </div>
        </div>

        {/* On Progress */}
        <div className="flex flex-col rounded-2xl border border-border p-5 gap-3 bg-white hover:ring-1 hover:ring-primary transition-all duration-300 cursor-default">
          <div className="flex items-center gap-2">
            <div className="size-11 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
              <Clock className="size-[22px] text-primary" />
            </div>
            <p className="font-medium text-secondary text-sm leading-tight">
              On Progress
            </p>
          </div>
          <div className="flex items-end justify-between gap-2">
            <p className="font-bold text-[28px] leading-8 text-foreground">
              {onProgress}
            </p>
            <span className="flex items-center text-primary text-[11px] font-bold bg-primary/10 px-2 py-1 rounded-full mb-1 shrink-0">
              {total > 0 ? Math.round((onProgress / total) * 100) : 0}%
            </span>
          </div>
        </div>

        {/* Belum Mulai */}
        <div className="flex flex-col rounded-2xl border border-border p-5 gap-3 bg-white hover:ring-1 hover:ring-primary transition-all duration-300 cursor-default">
          <div className="flex items-center gap-2">
            <div className="size-11 bg-muted rounded-xl flex items-center justify-center shrink-0">
              <ListTodo className="size-[22px] text-secondary" />
            </div>
            <p className="font-medium text-secondary text-sm leading-tight">
              Belum Mulai
            </p>
          </div>
          <div className="flex items-end justify-between gap-2">
            <p className="font-bold text-[28px] leading-8 text-foreground">
              {notStarted}
            </p>
            <span className="flex items-center text-secondary text-[11px] font-medium bg-muted px-2 py-1 rounded-full mb-1 shrink-0">
              {total > 0 ? Math.round((notStarted / total) * 100) : 0}%
            </span>
          </div>
        </div>

        {/* Delay / Melebihi SLA */}
        <div className="flex flex-col rounded-2xl border border-border p-5 gap-3 bg-white hover:ring-1 hover:ring-error transition-all duration-300 cursor-default">
          <div className="flex items-center gap-2">
            <div className="size-11 bg-error/10 rounded-xl flex items-center justify-center shrink-0">
              <AlertTriangle className="size-[22px] text-error" />
            </div>
            <p className="font-medium text-secondary text-sm leading-tight">
              Melebihi SLA
            </p>
          </div>
          <div className="flex items-end justify-between gap-2">
            <p className="font-bold text-[28px] leading-8 text-foreground">
              {delay}
            </p>
            <span className="flex items-center text-error text-[11px] font-bold bg-error-light px-2 py-1 rounded-full mb-1 shrink-0">
              Delay
            </span>
          </div>
        </div>
      </div>

      {/* ── Middle Row: Division Progress + Completion Ring ─────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Division / Summary (2/3) */}
        <div className="lg:col-span-2 flex flex-col rounded-2xl border border-border p-6 gap-5 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg text-foreground">
                {isAdmin ? "Progress per Divisi" : "Ringkasan Progress"}
              </h3>
              <p className="text-sm text-secondary">
                {isAdmin
                  ? "Distribusi status task tiap divisi"
                  : "Status distribusi task divisi Anda"}
              </p>
            </div>
            <Link
              href="/proker"
              className="text-sm text-primary font-semibold hover:underline flex items-center gap-1"
            >
              Detail <ArrowRight className="size-3.5" />
            </Link>
          </div>

          <div className="flex flex-col gap-5">
            {divisionStats.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 gap-2">
                <div className="size-12 bg-muted rounded-full flex items-center justify-center">
                  <Activity className="size-6 text-secondary" />
                </div>
                <p className="text-sm text-secondary">Belum ada data task</p>
              </div>
            ) : (
              divisionStats.map((div) => {
                const rate =
                  div.total > 0 ? Math.round((div.done / div.total) * 100) : 0;
                const doneW =
                  div.total > 0 ? (div.done / div.total) * 100 : 0;
                const onProgressW =
                  div.total > 0 ? (div.onProgress / div.total) * 100 : 0;
                const delayW =
                  div.total > 0 ? (div.delay / div.total) * 100 : 0;
                const notStartedW =
                  div.total > 0 ? (div.notStarted / div.total) * 100 : 0;

                return (
                  <div key={div.id} className="flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-sm text-foreground truncate">
                        {div.name}
                      </p>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs text-secondary">
                          {div.total} task
                        </span>
                        <span
                          className={`text-xs font-bold ${
                            rate >= 75
                              ? "text-success"
                              : rate >= 40
                              ? "text-primary"
                              : "text-error"
                          }`}
                        >
                          {rate}%
                        </span>
                      </div>
                    </div>

                    {/* Stacked progress bar */}
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden flex">
                      <div
                        className="h-full bg-success"
                        style={{ width: `${doneW}%` }}
                        title={`Done: ${div.done}`}
                      />
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${onProgressW}%` }}
                        title={`On Progress: ${div.onProgress}`}
                      />
                      <div
                        className="h-full bg-error"
                        style={{ width: `${delayW}%` }}
                        title={`Delay: ${div.delay}`}
                      />
                      <div
                        className="h-full bg-border"
                        style={{ width: `${notStartedW}%` }}
                        title={`Belum Mulai: ${div.notStarted}`}
                      />
                    </div>

                    <div className="flex items-center gap-3 text-[10px] text-secondary">
                      <span className="flex items-center gap-1">
                        <span className="size-1.5 rounded-full bg-success inline-block" />
                        Done: {div.done}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="size-1.5 rounded-full bg-primary inline-block" />
                        Progress: {div.onProgress}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="size-1.5 rounded-full bg-error inline-block" />
                        Delay: {div.delay}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="size-1.5 rounded-full bg-secondary/30 inline-block" />
                        Belum: {div.notStarted}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Completion Ring (1/3) */}
        <div className="flex flex-col rounded-2xl border border-border p-6 gap-4 bg-white">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg text-foreground">
              Tingkat Selesai
            </h3>
            <div className="size-9 bg-primary/10 rounded-xl flex items-center justify-center">
              <TrendingUp className="size-[18px] text-primary" />
            </div>
          </div>

          {/* CSS Donut Ring */}
          <div className="flex flex-col items-center justify-center py-3">
            <div
              className="size-[144px] rounded-full flex items-center justify-center"
              style={{
                background: `conic-gradient(
                  #30B22D 0% ${doneP}%,
                  #165DFF ${doneP}% ${doneP + onProgressP}%,
                  #ED6B60 ${doneP + onProgressP}% ${
                  doneP + onProgressP + delayP
                }%,
                  #EFF2F7 ${doneP + onProgressP + delayP}% 100%
                )`,
              }}
            >
              <div className="size-[96px] rounded-full bg-white flex flex-col items-center justify-center gap-0.5">
                <p className="font-bold text-2xl text-foreground leading-none">
                  {completionRate}%
                </p>
                <p className="text-[10px] text-secondary">Selesai</p>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
            {[
              { label: "Done", value: done, color: "bg-success" },
              { label: "Progress", value: onProgress, color: "bg-primary" },
              { label: "Delay", value: delay, color: "bg-error" },
              { label: "Belum", value: notStarted, color: "bg-secondary/20" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <span className={`size-2.5 rounded-full ${item.color} shrink-0`} />
                <span className="text-xs text-secondary">
                  {item.label}{" "}
                  <span className="font-semibold text-foreground">
                    ({item.value})
                  </span>
                </span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-border">
            <p className="text-xs text-secondary text-center">
              {total} total progress tercatat
            </p>
          </div>
        </div>
      </div>

      {/* ── Bottom Row: Recent Activities + Delayed Tasks ───────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities (2/3) */}
        <div className="lg:col-span-2 flex flex-col rounded-2xl border border-border p-6 bg-white">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg text-foreground">
              Aktivitas Terbaru
            </h3>
            <Link
              href="/weekly"
              className="text-sm text-primary font-semibold hover:underline flex items-center gap-1"
            >
              Lihat Semua <ArrowRight className="size-3.5" />
            </Link>
          </div>

          <div className="flex flex-col">
            {recentProgress.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <div className="size-12 bg-muted rounded-full flex items-center justify-center">
                  <Activity className="size-6 text-secondary" />
                </div>
                <p className="text-sm text-secondary">
                  Belum ada aktivitas progress
                </p>
              </div>
            ) : (
              recentProgress.map((p) => {
                const cfg =
                  STATUS_CONFIG[p.status as keyof typeof STATUS_CONFIG] ??
                  STATUS_CONFIG.NOT_STARTED;
                return (
                  <div
                    key={p.id}
                    className="flex items-start gap-4 py-4 border-b border-border hover:bg-muted/40 -mx-2 px-2 rounded-xl transition-all duration-200 last:border-0"
                  >
                    <div
                      className={`size-11 rounded-full ${cfg.bg} flex items-center justify-center shrink-0 ring-1 ring-border`}
                    >
                      <CheckCircle2 className={`size-5 ${cfg.icon}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <p className="font-semibold text-foreground text-sm truncate">
                          {p.actionPlan.name}
                        </p>
                        <span className="text-xs text-secondary shrink-0">
                          {formatDate(p.updatedAt)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${cfg.badge}`}
                        >
                          {cfg.label}
                        </span>
                        <p className="text-xs text-secondary truncate">
                          {
                            p.actionPlan.programKerja.strategy.division.name
                          }{" "}
                          · {p.week.label}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Task Delay / Melebihi SLA (1/3) */}
        <div className="flex flex-col rounded-2xl border border-error/25 p-6 gap-5 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="size-9 bg-error/10 rounded-xl flex items-center justify-center shrink-0">
                <AlertCircle className="size-[18px] text-error" />
              </div>
              <h3 className="font-bold text-base text-foreground">
                Task Delay
              </h3>
            </div>
            {delay > 0 && (
              <span className="text-[11px] font-bold text-error bg-error-light px-2.5 py-1 rounded-full">
                {delay} task
              </span>
            )}
          </div>

          <div className="flex flex-col gap-4 flex-1">
            {delayedTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center flex-1 py-6 gap-2">
                <div className="size-12 bg-success/10 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="size-6 text-success" />
                </div>
                <p className="text-sm font-semibold text-foreground">
                  Tidak ada delay!
                </p>
                <p className="text-xs text-secondary text-center">
                  Semua task berjalan sesuai SLA
                </p>
              </div>
            ) : (
              delayedTasks.map((t) => {
                const targetDate = t.actionPlan.programKerja.targetDate;
                let overdueLabel = "";
                if (targetDate) {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const target = new Date(targetDate);
                  target.setHours(0, 0, 0, 0);
                  const diffDays = Math.round(
                    (today.getTime() - target.getTime()) /
                      (1000 * 60 * 60 * 24)
                  );
                  if (diffDays > 0) overdueLabel = `+${diffDays}h terlambat`;
                  else if (diffDays === 0) overdueLabel = "Deadline hari ini";
                }
                return (
                  <div
                    key={t.id}
                    className="flex flex-col gap-1.5 pb-4 border-b border-border last:border-0 last:pb-0"
                  >
                    <p className="font-semibold text-sm text-foreground line-clamp-2">
                      {t.actionPlan.name}
                    </p>
                    <p className="text-xs text-secondary truncate">
                      {
                        t.actionPlan.programKerja.strategy.division.name
                      }{" "}
                      · {t.actionPlan.programKerja.name}
                    </p>
                    {overdueLabel && (
                      <span className="self-start text-[10px] font-bold text-error bg-error-light px-2 py-0.5 rounded-full">
                        {overdueLabel}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {delayedTasks.length > 0 && (
            <Link
              href="/weekly"
              className="flex items-center justify-center gap-1.5 text-sm text-primary font-semibold hover:underline pt-2 border-t border-border"
            >
              Kelola Delay <ArrowRight className="size-3.5" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
