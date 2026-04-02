import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { withHandler } from "@/lib/api-handler";

export const GET = withHandler(async (req: NextRequest, { params }: { params: Promise<{ weekId: string }> }) => {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { weekId } = await params;
  const { searchParams } = new URL(req.url);
  const divisionId = searchParams.get("divisionId");

  const week = await prisma.week.findUnique({
    where: { id: weekId },
    include: { period: true },
  });
  if (!week) return NextResponse.json({ error: "Week not found" }, { status: 404 });

  const nextWeek = await prisma.week.findFirst({
    where: {
      period: { year: { gte: week.period.year } },
      startDate: { gt: week.endDate },
    },
    orderBy: { startDate: "asc" },
  });

  const strategies = await prisma.strategy.findMany({
    where: divisionId ? { divisionId } : {},
    include: {
      division: true,
      programKerja: {
        include: {
          actionPlans: {
            include: {
              taskTimelines: {
                where: { weekId },
                include: { week: true },
              },
              weeklyProgress: {
                where: { weekId },
              },
            },
            orderBy: { number: "asc" },
          },
        },
        orderBy: { number: "asc" },
      },
    },
    orderBy: { number: "asc" },
  });

  return NextResponse.json({ week, nextWeek, strategies });
});

export const POST = withHandler(async (req: NextRequest, { params }: { params: Promise<{ weekId: string }> }) => {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { weekId } = await params;
  const body = await req.json();

  const updates: Array<{
    actionPlanId: string;
    currentProgress?: string;
    nextStep?: string;
    status: string;
  }> = body;

  await prisma.$transaction(
    updates.map(({ actionPlanId, currentProgress, nextStep, status }) =>
      prisma.weeklyProgress.upsert({
        where: { actionPlanId_weekId: { actionPlanId, weekId } },
        create: {
          actionPlanId,
          weekId,
          currentProgress: currentProgress ?? null,
          nextStep: nextStep ?? null,
          status: status as "DONE" | "ON_PROGRESS" | "NOT_STARTED" | "DELAY",
        },
        update: {
          currentProgress: currentProgress ?? null,
          nextStep: nextStep ?? null,
          status: status as "DONE" | "ON_PROGRESS" | "NOT_STARTED" | "DELAY",
        },
      })
    )
  );

  return NextResponse.json({ success: true });
});
