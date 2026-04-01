import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardClient } from "@/components/dashboard/DashboardClient";
import { isSuperAdmin, canManage } from "@/lib/permissions";

async function getDashboardData(
  targetDivId: string | null,
  role: string,
  dateFilter: string | null
) {
  const superAdmin = isSuperAdmin(role);

  let dateFilterWhere: any = undefined;
  if (dateFilter === "today") {
    const d = new Date(); d.setHours(0,0,0,0);
    dateFilterWhere = { gte: d };
  } else if (dateFilter === "7days") {
    const d = new Date(); d.setDate(d.getDate() - 7); d.setHours(0,0,0,0);
    dateFilterWhere = { gte: d };
  } else if (dateFilter === "month") {
    const d = new Date(); d.setDate(1); d.setHours(0,0,0,0);
    dateFilterWhere = { gte: d };
  } else if (dateFilter === "lastMonth") {
    const d = new Date(); d.setMonth(d.getMonth() - 1); d.setDate(1); d.setHours(0,0,0,0);
    const end = new Date(); end.setDate(0); end.setHours(23,59,59,999);
    dateFilterWhere = { gte: d, lte: end };
  }

  // Tentukan filter divisi sekali, dipakai di apWhere & wpWhere
  // - targetDivId selalu ada untuk ADMIN/MEMBER (di-set oleh caller)
  // - SUPER_ADMIN: targetDivId bisa null (lihat semua) atau spesifik (filter 1 divisi)
  const hasDivFilter = targetDivId !== null;
  const divisionIdFilter = hasDivFilter ? targetDivId : undefined;

  // Fallback: jika non-superAdmin tapi divisionId null → blok semua data
  const blockAll = !superAdmin && !targetDivId;

  const apDivWhere = blockAll
    ? { programKerja: { strategy: { divisionId: "___no_match___" } } }
    : hasDivFilter
      ? { programKerja: { strategy: { divisionId: divisionIdFilter } } }
      : {};

  const apWhere: any = { ...apDivWhere };
  if (dateFilterWhere) {
    apWhere.createdAt = dateFilterWhere;
  }

  const wpDivWhere = blockAll
    ? { actionPlan: { programKerja: { strategy: { divisionId: "___no_match___" } } } }
    : hasDivFilter
      ? { actionPlan: { programKerja: { strategy: { divisionId: divisionIdFilter } } } }
      : {};

  const wpWhere: any = { ...wpDivWhere };
  if (dateFilterWhere) {
    wpWhere.updatedAt = dateFilterWhere;
  }

  const [totalActionPlans, statusCounts, recentProgress, delayedTasks, allAPs] =
    await Promise.all([
      prisma.actionPlan.count({ where: apWhere }),

      prisma.weeklyProgress.groupBy({
        by: ["status"],
        _count: { status: true },
        where: wpWhere,
      }),

      prisma.weeklyProgress.findMany({
        where: wpWhere,
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
                  strategy: { select: { division: { select: { name: true } } } },
                },
              },
            },
          },
          week: { select: { label: true } },
        },
      }),

      prisma.weeklyProgress.findMany({
        where: { ...wpWhere, status: "DELAY" },
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
                  strategy: { select: { division: { select: { name: true } } } },
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
              strategy: { select: { division: { select: { id: true, name: true } } } },
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
    isAdmin: canManage(role),
  };
}

export default async function DashboardPage(
  props: { searchParams: Promise<{ div?: string; date?: string }> }
) {
  const searchParams = await props.searchParams;
  const session = await auth();
  if (!session?.user) return null;

  const superAdmin = isSuperAdmin(session.user.role);

  // SUPER_ADMIN bisa filter divisi bebas via query param
  // ADMIN/MEMBER selalu dikunci ke divisi sendiri
  const filterDivId = superAdmin
    ? (searchParams.div || null)
    : (session.user.divisionId ?? null);
  const filterDate = searchParams.date || null;

  const [data, divisions] = await Promise.all([
    getDashboardData(filterDivId, session.user.role, filterDate),
    prisma.division.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } })
  ]);

  return (
    <DashboardClient 
      data={data} 
      divisions={divisions} 
      userName={session.user.name || "User"} 
      userDivisionName={session.user.divisionName || ""} 
    />
  );
}
