import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { withHandler } from "@/lib/api-handler";
import { isSuperAdmin } from "@/lib/permissions";
type ClusterType = "GRAHA" | "GRIYA" | "SGM";

export const PATCH = withHandler(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const session = await auth();
  if (!session?.user || !isSuperAdmin(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const { name, cluster, clusterType } = body as Partial<{ name: string; cluster: string; clusterType: ClusterType }>;

  const data: Record<string, unknown> = {};
  if (name?.trim()) data.name = name.trim();
  if (cluster?.trim()) data.cluster = cluster.trim();
  if (clusterType) data.clusterType = clusterType;

  const project = await prisma.project.update({ where: { id }, data });
  return NextResponse.json(project);
});

export const DELETE = withHandler(async (_: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const session = await auth();
  if (!session?.user || !isSuperAdmin(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  await prisma.project.delete({ where: { id } });
  return NextResponse.json({ success: true });
});
