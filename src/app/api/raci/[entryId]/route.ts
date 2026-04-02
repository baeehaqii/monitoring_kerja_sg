import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { withHandler } from "@/lib/api-handler";

export const DELETE = withHandler(async (
  _req: Request,
  { params }: { params: Promise<{ entryId: string }> }
) => {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { entryId } = await params;
  await prisma.raciEntry.delete({ where: { id: entryId } });
  return NextResponse.json({ ok: true });
});
