import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { withHandler } from "@/lib/api-handler";
import { isSuperAdmin } from "@/lib/permissions";
type ClusterType = "GRAHA" | "GRIYA" | "SGM";

export const GET = withHandler(async () => {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (isSuperAdmin(session.user.role)) {
    const projects = await prisma.project.findMany({
      orderBy: [{ clusterType: "asc" }, { cluster: "asc" }, { name: "asc" }],
      include: {
        _count: { select: { userProjects: true, strategies: true } },
      },
    });
    return NextResponse.json(projects);
  }

  // Non-admin: return only assigned projects
  const userProjects = await prisma.userProject.findMany({
    where: { userId: session.user.id },
    include: { project: true },
    orderBy: [{ project: { clusterType: "asc" } }, { project: { cluster: "asc" } }, { project: { name: "asc" } }],
  });

  return NextResponse.json(userProjects.map((up) => up.project));
});

export const POST = withHandler(async (req: NextRequest) => {
  const session = await auth();
  if (!session?.user || !isSuperAdmin(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { name, cluster, clusterType } = body as {
    name: string;
    cluster: string;
    clusterType: ClusterType;
  };

  if (!name?.trim() || !cluster?.trim() || !clusterType) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const existing = await prisma.project.findUnique({ where: { name: name.trim() } });
  if (existing) return NextResponse.json({ error: "Nama proyek sudah ada" }, { status: 409 });

  const project = await prisma.project.create({
    data: { name: name.trim(), cluster: cluster.trim(), clusterType },
  });

  return NextResponse.json(project, { status: 201 });
});
