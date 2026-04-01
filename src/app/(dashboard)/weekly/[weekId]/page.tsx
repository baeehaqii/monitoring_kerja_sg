import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/Header";
import { WeeklyProgressClient } from "@/components/weekly/WeeklyProgressClient";
import { notFound } from "next/navigation";
import { divisionStrategyFilter } from "@/lib/permissions";

export default async function WeeklyProgressPage({ params }: { params: Promise<{ weekId: string }> }) {
  const session = await auth();
  if (!session?.user) return null;

  const { weekId } = await params;

  const week = await prisma.week.findUnique({
    where: { id: weekId },
    include: { period: true },
  });

  if (!week) notFound();

  const nextWeek = await prisma.week.findFirst({
    where: { startDate: { gt: week.endDate } },
    orderBy: { startDate: "asc" },
    include: { period: true },
  });

  const prevWeek = await prisma.week.findFirst({
    where: { endDate: { lt: week.startDate } },
    orderBy: { endDate: "desc" },
    include: { period: true },
  });

  const strategies = await prisma.strategy.findMany({
    where: divisionStrategyFilter(session.user),
    include: {
      division: true,
      period: { include: { weeks: { orderBy: { weekNumber: "asc" } } } },
      programKerja: {
        include: {
          actionPlans: {
            include: {
              taskTimelines: { where: { weekId } },
              weeklyProgress: { where: { weekId } },
            },
            orderBy: { number: "asc" },
          },
        },
        orderBy: { number: "asc" },
      },
    },
    orderBy: { number: "asc" },
  });

  return (
    <div>
      <Header
        title={`Weekly Progress — ${week.period.name}`}
        subtitle={`Week ${week.weekNumber}: ${week.label}`}
      />
      <WeeklyProgressClient
        week={JSON.parse(JSON.stringify(week))}
        nextWeek={nextWeek ? JSON.parse(JSON.stringify(nextWeek)) : null}
        prevWeek={prevWeek ? JSON.parse(JSON.stringify(prevWeek)) : null}
        strategies={JSON.parse(JSON.stringify(strategies))}
        userRole={session.user.role}
      />
    </div>
  );
}
