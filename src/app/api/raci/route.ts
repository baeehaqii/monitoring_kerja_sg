import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { withHandler } from "@/lib/api-handler";

export const GET = withHandler(async () => {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const matrices = await prisma.raciMatrix.findMany({
    include: {
      entries: { orderBy: [{ type: "asc" }, { order: "asc" }] },
    },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(matrices);
});

export const POST = withHandler(async (req: NextRequest) => {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { matrixId, role, type } = await req.json();
  if (!matrixId || !role?.trim() || !type) {
    return NextResponse.json({ error: "matrixId, role, dan type wajib diisi" }, { status: 400 });
  }

  const VALID_TYPES = ["ACCOUNTABLE", "RESPONSIBLE", "CONSULTED", "INFORMED"];
  if (!VALID_TYPES.includes(type)) {
    return NextResponse.json({ error: "Type tidak valid" }, { status: 400 });
  }

  // hitung order berikutnya
  const lastEntry = await prisma.raciEntry.findFirst({
    where: { matrixId, type },
    orderBy: { order: "desc" },
  });
  const nextOrder = (lastEntry?.order ?? 0) + 1;

  const entry = await prisma.raciEntry.create({
    data: { matrixId, role: role.trim(), type, order: nextOrder },
  });
  return NextResponse.json(entry, { status: 201 });
});
