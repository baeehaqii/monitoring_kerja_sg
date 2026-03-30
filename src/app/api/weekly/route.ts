import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const periodId = searchParams.get("periodId");

  const weeks = await prisma.week.findMany({
    where: periodId ? { periodId } : {},
    include: {
      period: true,
      _count: {
        select: { weeklyProgress: true },
      },
    },
    orderBy: [{ period: { startDate: "asc" } }, { weekNumber: "asc" }],
  });

  return NextResponse.json(weeks);
}
