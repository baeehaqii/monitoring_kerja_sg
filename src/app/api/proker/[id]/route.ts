import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const pk = await prisma.programKerja.findUnique({
    where: { id },
    include: {
      strategy: { include: { division: true, period: { include: { weeks: { orderBy: { weekNumber: "asc" } } } } } },
      actionPlans: {
        include: {
          taskTimelines: { include: { week: { include: { period: true } } } },
          weeklyProgress: { include: { week: true }, orderBy: { week: { startDate: "asc" } } },
        },
        orderBy: { number: "asc" },
      },
    },
  });

  if (!pk) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(pk);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { name, targetDate, keterangan, raciAccountable, raciResponsible, raciConsulted, raciInformed } = body;

  const pk = await prisma.programKerja.update({
    where: { id },
    data: {
      name,
      targetDate: targetDate ? new Date(targetDate) : null,
      keterangan: keterangan || null,
      raciAccountable: raciAccountable || null,
      raciResponsible: raciResponsible || null,
      raciConsulted: raciConsulted || null,
      raciInformed: raciInformed || null,
    },
  });

  return NextResponse.json(pk);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  await prisma.programKerja.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
