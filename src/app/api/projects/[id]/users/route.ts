import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { withHandler } from "@/lib/api-handler";
import { isSuperAdmin } from "@/lib/permissions";

export const GET = withHandler(async (_: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const session = await auth();
  if (!session?.user || !isSuperAdmin(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  const [allUsers, assignments] = await Promise.all([
    prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, division: { select: { name: true } } },
      orderBy: { name: "asc" },
    }),
    prisma.userProject.findMany({ where: { projectId: id }, select: { userId: true } }),
  ]);

  const assignedSet = new Set(assignments.map((a) => a.userId));
  return NextResponse.json(allUsers.map((u) => ({ ...u, hasAccess: assignedSet.has(u.id) })));
});

export const POST = withHandler(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const session = await auth();
  if (!session?.user || !isSuperAdmin(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id: projectId } = await params;
  const { userId } = await req.json();
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  const record = await prisma.userProject.upsert({
    where: { userId_projectId: { userId, projectId } },
    create: { userId, projectId },
    update: {},
  });

  return NextResponse.json(record, { status: 201 });
});

export const DELETE = withHandler(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const session = await auth();
  if (!session?.user || !isSuperAdmin(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id: projectId } = await params;
  const { userId } = await req.json();
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  await prisma.userProject.deleteMany({ where: { userId, projectId } });
  return NextResponse.json({ success: true });
});
