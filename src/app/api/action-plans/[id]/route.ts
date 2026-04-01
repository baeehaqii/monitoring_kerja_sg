import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { withHandler } from "@/lib/api-handler";

export const PUT = withHandler(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { name, plannedWeekIds } = body;

  await prisma.$transaction(async (tx) => {
    await tx.actionPlan.update({ where: { id }, data: { name } });

    if (plannedWeekIds !== undefined) {
      await tx.taskTimeline.deleteMany({ where: { actionPlanId: id } });
      if (plannedWeekIds.length > 0) {
        await tx.taskTimeline.createMany({
          data: (plannedWeekIds as string[]).map((weekId) => ({
            actionPlanId: id,
            weekId,
            isPlanned: true,
          })),
        });
      }
    }
  });

  const updated = await prisma.actionPlan.findUnique({
    where: { id },
    include: { taskTimelines: { include: { week: true } } },
  });

  return NextResponse.json(updated);
});

export const DELETE = withHandler(async (_: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.actionPlan.delete({ where: { id } });

  return NextResponse.json({ success: true });
});
