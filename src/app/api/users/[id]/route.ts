import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  // Allow user to update own profile, admins can update anyone
  const isAdmin = ["ADMIN", "SUPER_ADMIN"].includes(session.user.role);
  if (session.user.id !== id && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { name, role, divisionId, whatsappNumber, password } = body;

  const updateData: Record<string, unknown> = {
    name,
    whatsappNumber: whatsappNumber || null,
  };

  if (isAdmin) {
    updateData.role = role;
    updateData.divisionId = divisionId || null;
  }

  if (password) {
    updateData.password = await hash(password, 12);
  }

  const user = await prisma.user.update({
    where: { id },
    data: updateData,
    select: { id: true, name: true, email: true, role: true, divisionId: true, whatsappNumber: true },
  });

  return NextResponse.json(user);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  await prisma.user.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
