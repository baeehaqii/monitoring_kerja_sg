import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const {
    strategyId, number, name,
    targetDate, keterangan,
    raciAccountable, raciResponsible, raciConsulted, raciInformed,
  } = body;

  if (!strategyId || !number || !name) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const pk = await prisma.programKerja.create({
    data: {
      strategyId,
      number: Number(number),
      name,
      targetDate: targetDate ? new Date(targetDate) : null,
      keterangan: keterangan || null,
      raciAccountable: raciAccountable || null,
      raciResponsible: raciResponsible || null,
      raciConsulted: raciConsulted || null,
      raciInformed: raciInformed || null,
    },
    include: { strategy: { include: { division: true } } },
  });

  return NextResponse.json(pk, { status: 201 });
}
