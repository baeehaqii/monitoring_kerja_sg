import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardClient } from "@/components/dashboard/DashboardClient";
import { isSuperAdmin, canManage } from "@/lib/permissions";

async function getUserAccessibleProjectIds(userId: string): Promise<string[]> {
  const records = await prisma.userProject.findMany({
    where: { userId },
    select: { projectId: true },
  });
  return records.map((r) => r.projectId);
}

async function getDashboardData(
  role: string,
  accessibleProjectIds: string[] | null,
  selectedProjectId: string | null,
  selectedDivId: string | null,
  dateFilter: string | null
) {
  const superAdmin = isSuperAdmin(role);

  let dateFilterWhere: any = undefined;
  if (dateFilter === "today") {
    const d = new Date(); d.setHours(0, 0, 0, 0);
    dateFilterWhere = { gte: d };
  } else if (dateFilter === "7days") {
    const d = new Date(); d.setDate(d.getDate() - 7); d.setHours(0, 0, 0, 0);
    dateFilterWhere = { gte: d };
  } else if (dateFilter === "month") {
    const d = new Date(); d.setDate(1); d.setHours(0, 0, 0, 0);
    dateFilterWhere = { gte: d };
  } else if (dateFilter === "lastMonth") {
    const d = new Date(); d.setMonth(d.getMonth() - 1); d.setDate(1); d.setHours(0, 0, 0, 0);
    const end = new Date(); end.setDate(0); end.setHours(23, 59, 59, 999);
    dateFilterWhere = { gte: d, lte: end };
  }

  // Build strategy-level filter
  let strategyFilter: any = {};
  if (superAdmin) {
    if (selectedProjectId) strategyFilter = { projectId: selectedProjectId };
    else if (selectedDivId) strategyFilter = { divisionId: selectedDivId };
  } else {
    if (!accessibleProjectIds || accessibleProjectIds.length === 0) {
      strategyFilter = { projectId: "___no_match___" };
    } else if (selectedProjectId && accessibleProjectIds.includes(selectedProjectId)) {
      strategyFilter = { projectId: selectedProjectId };
    } else {
      strategyFilter = { projectId: { in: accessibleProjectIds } };
    }
  }

  const apWhere: any = {
    programKerja: { strategy: strategyFilter },
    ...(dateFilterWhere ? { createdAt: dateFilterWhere } : {}),
  };

  const wpWhere: any = {
    actionPlan: { programKerja: { strategy: strategyFilter } },
    ...(dateFilterWhere ? { updatedAt: dateFilterWhere } : {}),
  };

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
                  strategy: {
                    select: {
                      division: { select: { name: true } },
                      project: { select: { name: true } },
                    },
                  },
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
                  strategy: {
                    select: {
                      division: { select: { name: true } },
                      project: { select: { name: true } },
                    },
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

  type DivStats = { id: string; name: string; done: number; onProgress: number; delay: number; notStarted: number; total: number };
  const divMap = new Map<string, DivStats>();
  for (const ap of allAPs) {
    const div = ap.programKerja.strategy.division;
    if (!divMap.has(div.id)) {
      divMap.set(div.id, { id: div.id, name: div.name, done: 0, onProgress: 0, delay: 0, notStarted: 0, total: 0 });
    }
    const ds = divMap.get(div.id)!;
    const st = ap.weeklyProgress[0]?.status ?? "NOT_STARTED";
    ds.total++;
    if (st === "DONE") ds.done++;
    else if (st === "ON_PROGRESS") ds.onProgress++;
    else if (st === "DELAY") ds.delay++;
    else ds.notStarted++;
  }

  return {
    totalActionPlans,
    done,
    onProgress,
    notStarted,
    delay,
    total,
    recentProgress,
    delayedTasks,
    divisionStats: Array.from(divMap.values()).sort((a, b) => b.total - a.total),
    isAdmin: canManage(role),
  };
}

export default async function DashboardPage(
  props: { searchParams: Promise<{ div?: string; project?: string; date?: string }> }
) {
  const searchParams = await props.searchParams;
  const session = await auth();
  if (!session?.user) return null;

  const superAdmin = isSuperAdmin(session.user.role);
  const selectedProjectId = searchParams.project || null;
  const selectedDivId = superAdmin ? (searchParams.div || null) : null;
  const filterDate = searchParams.date || null;

  const accessibleProjectIds = superAdmin
    ? null
    : await getUserAccessibleProjectIds(session.user.id);

  const [data, divisions, projects] = await Promise.all([
    getDashboardData(session.user.role, accessibleProjectIds, selectedProjectId, selectedDivId, filterDate),
    superAdmin
      ? prisma.division.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } })
      : Promise.resolve([]),
    superAdmin
      ? prisma.project.findMany({
          orderBy: [{ clusterType: "asc" }, { cluster: "asc" }, { name: "asc" }],
          select: { id: true, name: true, cluster: true },
        })
      : accessibleProjectIds && accessibleProjectIds.length > 0
        ? prisma.project.findMany({
            where: { id: { in: accessibleProjectIds } },
            orderBy: [{ clusterType: "asc" }, { cluster: "asc" }, { name: "asc" }],
            select: { id: true, name: true, cluster: true },
          })
        : Promise.resolve([]),
  ]);

  return (
    <DashboardClient
      data={data}
      divisions={divisions}
      projects={projects}
      userName={session.user.name || "User"}
      userDivisionName={session.user.divisionName || ""}
      isSuperAdmin={superAdmin}
    />
  );
}
