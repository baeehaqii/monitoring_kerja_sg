import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { withHandler } from "@/lib/api-handler";
import { canManage } from "@/lib/permissions";

export const POST = withHandler(async (req: NextRequest) => {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canManage(session.user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { programKerjaId, number, name, targetDate, plannedWeekIds } = body;

  if (!programKerjaId || !number || !name) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const ap = await prisma.actionPlan.create({
    data: {
      programKerjaId,
      number: Number(number),
      name,
      targetDate: targetDate ? new Date(targetDate) : null,
      taskTimelines: plannedWeekIds?.length
        ? {
            create: (plannedWeekIds as string[]).map((weekId) => ({
              weekId,
              isPlanned: true,
            })),
          }
        : undefined,
    },
    include: {
      taskTimelines: { include: { week: true } },
    },
  });

  return NextResponse.json(ap, { status: 201 });
});
