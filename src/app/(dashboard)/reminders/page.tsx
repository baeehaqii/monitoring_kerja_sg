import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/Header";
import { RemindersClient } from "@/components/RemindersClient";

export default async function RemindersPage() {
  const session = await auth();
  if (!session?.user) return null;

  const isAdmin = ["ADMIN", "SUPER_ADMIN"].includes(session.user.role);

  const [reminders, actionPlans, users] = await Promise.all([
    prisma.reminder.findMany({
      where: isAdmin ? {} : { userId: session.user.id },
      include: {
        actionPlan: {
          include: {
            programKerja: {
              include: { strategy: { include: { division: true } } },
            },
            weeklyProgress: { orderBy: { updatedAt: "desc" }, take: 1 },
          },
        },
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { reminderDate: "desc" },
      take: 50,
    }),
    prisma.actionPlan.findMany({
      include: {
        programKerja: {
          include: { strategy: { include: { division: true } } },
        },
      },
      orderBy: { programKerja: { name: "asc" } },
    }),
    isAdmin ? prisma.user.findMany({
      select: { id: true, name: true, email: true, whatsappNumber: true },
      orderBy: { name: "asc" },
    }) : [],
  ]);

  return (
    <div>
      <Header title="Pengingat SLA" subtitle="Kelola dan kirim pengingat WhatsApp otomatis" />
      <RemindersClient
        reminders={JSON.parse(JSON.stringify(reminders))}
        actionPlans={JSON.parse(JSON.stringify(actionPlans))}
        users={JSON.parse(JSON.stringify(users))}
        currentUserId={session.user.id}
        isAdmin={isAdmin}
      />
    </div>
  );
}
