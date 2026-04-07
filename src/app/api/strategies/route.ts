import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { withHandler } from "@/lib/api-handler";
import { canManage } from "@/lib/permissions";

export const GET = withHandler(async (req: NextRequest) => {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const divisionId = searchParams.get("divisionId");
  const periodId = searchParams.get("periodId");

  if (searchParams.get("nextNumber") === "1") {
    if (!divisionId || !periodId) {
      return NextResponse.json({ nextNumber: 1 });
    }
    const count = await prisma.strategy.count({ where: { divisionId, periodId } });
    return NextResponse.json({ nextNumber: count + 1 });
  }

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
});

export const POST = withHandler(async (req: NextRequest) => {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canManage(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const divisionId = session.user.divisionId;
  if (!divisionId) {
    const name = session.user.name ?? session.user.email ?? "akun Anda";
    return NextResponse.json({
      error: `Akun "${name}" belum memiliki divisi. Hubungi help.siproper.com untuk menambahkan divisi pada akun ini.`,
    }, { status: 400 });
  }

  const body = await req.json();
  const { periodId, name } = body;

  if (!periodId || !name) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const count = await prisma.strategy.count({ where: { divisionId, periodId } });
  const number = count + 1;

  const strategy = await prisma.strategy.create({
    data: { divisionId, periodId, number, name },
    include: { division: true, period: true },
  });

  return NextResponse.json(strategy, { status: 201 });
});
