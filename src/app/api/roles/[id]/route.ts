import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { withHandler } from "@/lib/api-handler";

export const GET = withHandler(async (_req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const session = await auth();
  if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const role = await prisma.role.findUnique({
    where: { id },
    include: {
      permissions: { orderBy: { menu: "asc" } },
      _count: { select: { users: true } },
    },
  });

  if (!role) return NextResponse.json({ error: "Role tidak ditemukan" }, { status: 404 });
  return NextResponse.json(role);
});

export const PUT = withHandler(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const role = await prisma.role.findUnique({ where: { id } });
  if (!role) return NextResponse.json({ error: "Role tidak ditemukan" }, { status: 404 });
  if (role.isSystem) return NextResponse.json({ error: "Role sistem tidak bisa diubah" }, { status: 400 });

  const { name, description, permissions } = await req.json() as {
    name: string;
    description?: string;
    permissions: { menu: string; canView: boolean; canCreate: boolean; canEdit: boolean; canDelete: boolean }[];
  };

  if (!name?.trim()) {
    return NextResponse.json({ error: "Nama role wajib diisi" }, { status: 400 });
  }

  const conflict = await prisma.role.findFirst({ where: { name: name.trim(), id: { not: id } } });
  if (conflict) return NextResponse.json({ error: "Nama role sudah digunakan" }, { status: 409 });

  // Replace all permissions
  await prisma.rolePermission.deleteMany({ where: { roleId: id } });

  const updated = await prisma.role.update({
    where: { id },
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

  return NextResponse.json(updated);
});

export const DELETE = withHandler(async (_req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const role = await prisma.role.findUnique({ where: { id }, include: { _count: { select: { users: true } } } });
  if (!role) return NextResponse.json({ error: "Role tidak ditemukan" }, { status: 404 });
  if (role.isSystem) return NextResponse.json({ error: "Role sistem tidak bisa dihapus" }, { status: 400 });
  if (role._count.users > 0) {
    return NextResponse.json({ error: `Role masih digunakan oleh ${role._count.users} pengguna` }, { status: 400 });
  }

  await prisma.role.delete({ where: { id } });
  return NextResponse.json({ deleted: true });
});
