import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendWhatsAppMessage, buildReminderMessage } from "@/lib/whatsapp";
import { withHandler } from "@/lib/api-handler";
import { logger } from "@/lib/logger";

export const GET = withHandler(async (req: NextRequest) => {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  const pendingReminders = await prisma.reminder.findMany({
    where: { sent: false, reminderDate: { lte: now } },
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

  let sentCount = 0;
  let failCount = 0;

  for (const r of pendingReminders) {
    if (!r.user.whatsappNumber) continue;

    const status = r.actionPlan.weeklyProgress?.[0]?.status ?? "NOT_STARTED";
    const msg =
      r.message ||
      buildReminderMessage({
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
      sentCount++;
    } else {
      failCount++;
      logger.warn({ reminderId: r.id, userId: r.userId }, "Cron: failed to send WhatsApp reminder");
    }
  }

  logger.info({ processed: pendingReminders.length, sent: sentCount, failed: failCount }, "Cron reminders processed");

  return NextResponse.json({
    processed: pendingReminders.length,
    sent: sentCount,
    failed: failCount,
    timestamp: now.toISOString(),
  });
});
