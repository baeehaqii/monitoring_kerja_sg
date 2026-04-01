import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
import { withHandler } from "@/lib/api-handler";

export const POST = withHandler(async (req: NextRequest) => {
  const session = await auth();
  if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { actionPlanId, userId, message } = await req.json();

  if (!actionPlanId || !userId || !message) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { whatsappNumber: true, name: true },
  });

  if (!user?.whatsappNumber) {
    return NextResponse.json({ error: "User has no WhatsApp number" }, { status: 422 });
  }

  const ok = await sendWhatsAppMessage({ target: user.whatsappNumber, message });

  if (!ok) {
    return NextResponse.json({ error: "Failed to send WhatsApp message" }, { status: 502 });
  }

  // Record as sent reminder
  const reminder = await prisma.reminder.create({
    data: {
      actionPlanId,
      userId,
      reminderDate: new Date(),
      message,
      sent: true,
      sentAt: new Date(),
    },
  });

  return NextResponse.json({ ok: true, reminderId: reminder.id });
});
