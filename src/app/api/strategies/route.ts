import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const divisionId = searchParams.get("divisionId");
  const periodId = searchParams.get("periodId");

  const strategies = await prisma.strategy.findMany({
    where: {
      ...(divisionId ? { divisionId } : {}),
      ...(periodId ? { periodId } : {}),
    },
    include: {
      division: true,
      period: true,
      programKerja: {
        include: {
          actionPlans: {
            include: {
              weeklyProgress: { orderBy: { updatedAt: "desc" }, take: 1 },
              taskTimelines: { include: { week: true } },
            },
          },
        },
        orderBy: { number: "asc" },
      },
    },
    orderBy: { number: "asc" },
  });

  return NextResponse.json(strategies);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { divisionId, periodId, number, name } = body;

  if (!divisionId || !periodId || !number || !name) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const strategy = await prisma.strategy.create({
    data: { divisionId, periodId, number: Number(number), name },
    include: { division: true, period: true },
  });

  return NextResponse.json(strategy, { status: 201 });
}
