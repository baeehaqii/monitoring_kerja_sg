import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { withHandler } from "@/lib/api-handler";

export const GET = withHandler(async () => {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const divisions = await prisma.division.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(divisions);
});

export const POST = withHandler(async (req: NextRequest) => {
  const session = await auth();
  if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { name } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "Name required" }, { status: 400 });

  const division = await prisma.division.create({ data: { name: name.trim() } });
  return NextResponse.json(division, { status: 201 });
});
