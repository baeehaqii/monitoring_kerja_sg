import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { withHandler } from "@/lib/api-handler";

export const GET = withHandler(async () => {
  const session = await auth();
  if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const roles = await prisma.role.findMany({
    include: {
      permissions: { orderBy: { menu: "asc" } },
      _count: { select: { users: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(roles);
});

export const POST = withHandler(async (req: NextRequest) => {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { name, description, permissions } = await req.json() as {
    name: string;
    description?: string;
    permissions: { menu: string; canView: boolean; canCreate: boolean; canEdit: boolean; canDelete: boolean }[];
  };

  if (!name?.trim()) {
    return NextResponse.json({ error: "Nama role wajib diisi" }, { status: 400 });
  }

  const existing = await prisma.role.findUnique({ where: { name: name.trim() } });
  if (existing) {
    return NextResponse.json({ error: "Nama role sudah digunakan" }, { status: 409 });
  }

  const role = await prisma.role.create({
    data: {
      name: name.trim(),
      description: description?.trim() || null,
      permissions: {
        create: (permissions ?? []).map((p) => ({
          menu: p.menu,
          canView: p.canView,
          canCreate: p.canCreate,
          canEdit: p.canEdit,
          canDelete: p.canDelete,
        })),
      },
    },
    include: {
      permissions: { orderBy: { menu: "asc" } },
      _count: { select: { users: true } },
    },
  });

  return NextResponse.json(role, { status: 201 });
});
