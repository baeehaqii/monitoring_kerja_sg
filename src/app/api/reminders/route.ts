import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendWhatsAppMessage, buildReminderMessage } from "@/lib/whatsapp";
import { withHandler } from "@/lib/api-handler";

export const GET = withHandler(async () => {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const reminders = await prisma.reminder.findMany({
    where: session.user.role === "MEMBER" ? { userId: session.user.id } : {},
    include: {
      actionPlan: {
        include: {
          programKerja: {
            include: { strategy: { include: { division: true } } },
          },
        },
      },
      user: { select: { name: true, email: true, whatsappNumber: true } },
    },
    orderBy: { reminderDate: "desc" },
    take: 50,
  });

  return NextResponse.json(reminders);
});

export const POST = withHandler(async (req: NextRequest) => {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { actionPlanId, userId, reminderDate, message } = body;

  const reminder = await prisma.reminder.create({
    data: {
      actionPlanId,
      userId: userId ?? session.user.id,
      reminderDate: new Date(reminderDate),
      message,
    },
  });

  return NextResponse.json(reminder, { status: 201 });
});

export const PUT = withHandler(async () => {
  const session = await auth();
  if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const now = new Date();
  const pendingReminders = await prisma.reminder.findMany({
    where: {
      sent: false,
      reminderDate: { lte: now },
    },
    include: {
      user: true,
      actionPlan: {
        include: {
          programKerja: true,
          weeklyProgress: { orderBy: { updatedAt: "desc" }, take: 1 },
        },
      },
    },
  });

  const results = await Promise.allSettled(
    pendingReminders.map(async (r) => {
      if (!r.user.whatsappNumber) return;

      const status = r.actionPlan.weeklyProgress?.[0]?.status ?? "NOT_STARTED";
      const msg = r.message || buildReminderMessage({
        userName: r.user.name,
        taskName: r.actionPlan.name,
        programKerjaName: r.actionPlan.programKerja.name,
        targetDate: r.actionPlan.programKerja.targetDate,
        status,
      });

      const ok = await sendWhatsAppMessage({ target: r.user.whatsappNumber, message: msg });
      if (ok) {
        await prisma.reminder.update({
          where: { id: r.id },
          data: { sent: true, sentAt: now },
        });
      }
    })
  );

  const sent = results.filter((r) => r.status === "fulfilled").length;
  return NextResponse.json({ sent, total: pendingReminders.length });
});
