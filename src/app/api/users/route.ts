import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import { withHandler } from "@/lib/api-handler";

export const GET = withHandler(async () => {
  const session = await auth();
  if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    select: {
      id: true, name: true, email: true, role: true,
      divisionId: true, whatsappNumber: true, createdAt: true,
      division: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(users);
});

export const DELETE = withHandler(async (req: NextRequest) => {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { ids } = await req.json() as { ids: string[] };
  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: "ids required" }, { status: 400 });
  }

  // Prevent deleting own account
  const filteredIds = ids.filter((id) => id !== session.user.id);
  await prisma.user.deleteMany({ where: { id: { in: filteredIds } } });

  return NextResponse.json({ deleted: filteredIds.length });
});

export const POST = withHandler(async (req: NextRequest) => {
  const session = await auth();
  if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { name, email, password, role, divisionId, whatsappNumber } = body;

  if (!name || !email || !password) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return NextResponse.json({ error: "Email sudah digunakan" }, { status: 409 });

  const hashed = await hash(password, 12);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashed,
      role: role ?? "MEMBER",
      divisionId: divisionId || null,
      whatsappNumber: whatsappNumber || null,
    },
    select: { id: true, name: true, email: true, role: true, divisionId: true, createdAt: true },
  });

  return NextResponse.json(user, { status: 201 });
});
