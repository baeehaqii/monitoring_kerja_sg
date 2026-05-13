import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { withHandler } from "@/lib/api-handler";
import { hasPermission } from "@/lib/permissions";

export const POST = withHandler(async (req: NextRequest) => {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasPermission(session.user, "proker", "canCreate")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const {
    strategyId, name,
    keterangan,
    raciAccountable, raciResponsible, raciConsulted, raciInformed,
  } = body;

  if (!strategyId || !name) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const count = await prisma.programKerja.count({ where: { strategyId } });
  const number = count + 1;

  const pk = await prisma.programKerja.create({
    data: {
      strategyId,
      number,
      name,
      keterangan: keterangan || null,
      raciAccountable: raciAccountable || null,
      raciResponsible: raciResponsible || null,
      raciConsulted: raciConsulted || null,
      raciInformed: raciInformed || null,
    },
    include: { strategy: { include: { division: true } } },
  });

  return NextResponse.json(pk, { status: 201 });
});
