import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/Header";
import { RemindersClient } from "@/components/RemindersClient";
import { isSuperAdmin, canManage } from "@/lib/permissions";

export default async function RemindersPage() {
  const session = await auth();
  if (!session?.user) return null;

  const superAdmin = isSuperAdmin(session.user.role);
  const isAdmin = canManage(session.user.role);
  const userDivisionId = session.user.divisionId;

  const now = new Date();
  const threeDaysLater = new Date(now);
  threeDaysLater.setDate(threeDaysLater.getDate() + 3);

  // Fetch all action plans that are at-risk per divisi:
  // SUPER_ADMIN lihat semua; user lain hanya divisi sendiri
  // Kondisi at-risk: deadline dalam 3 hari ATAU status DELAY
  const atRiskRaw = await prisma.actionPlan.findMany({
    where: {
      AND: [
        // Filter divisi (hanya berlaku untuk non-SUPER_ADMIN)
        ...(superAdmin
          ? []
          : [
              {
                programKerja: {
                  strategy: { divisionId: userDivisionId ?? "___no_match___" },
                },
              },
            ]),
        // Kondisi at-risk
        {
          OR: [
            // Approaching or past deadline
            {
              programKerja: {
                targetDate: { not: null, lte: threeDaysLater },
              },
            },
            // Manually marked as DELAY in weekly progress
            {
              weeklyProgress: {
                some: { status: "DELAY" },
              },
            },
          ],
        },
      ],
    },
    include: {
      programKerja: {
        include: {
          strategy: { include: { division: true } },
        },
      },
      weeklyProgress: {
        orderBy: { updatedAt: "desc" },
        take: 1,
      },
    },
    orderBy: { programKerja: { targetDate: "asc" } },
  });

  // Exclude completed action plans, deduplicate by id
  const seen = new Set<string>();
  const slaAlerts = atRiskRaw.filter((ap) => {
    if (seen.has(ap.id)) return false;
    seen.add(ap.id);
    return ap.weeklyProgress[0]?.status !== "DONE";
  });

  // Sent reminder history: SUPER_ADMIN lihat semua, lainnya filter per divisi
  const sentHistory = await prisma.reminder.findMany({
    where: {
      sent: true,
      ...(superAdmin
        ? {}
        : {
            actionPlan: {
              programKerja: {
                strategy: { divisionId: userDivisionId ?? "___no_match___" },
              },
            },
          }),
    },
    include: {
      actionPlan: {
        include: {
          programKerja: {
            include: { strategy: { include: { division: true } } },
          },
        },
      },
      user: { select: { id: true, name: true, email: true } },
    },
    orderBy: { sentAt: "desc" },
    take: 30,
  });

  // Users with whatsapp for sending notifications
  const users = isAdmin
    ? await prisma.user.findMany({
        select: { id: true, name: true, email: true, whatsappNumber: true },
        orderBy: { name: "asc" },
      })
    : [];

  return (
    <div>
      <Header
        title="Pengingat SLA"
        subtitle="Deteksi otomatis action plan yang mendekati atau melewati batas waktu"
      />
      <RemindersClient
        slaAlerts={JSON.parse(JSON.stringify(slaAlerts))}
        sentHistory={JSON.parse(JSON.stringify(sentHistory))}
        users={JSON.parse(JSON.stringify(users))}
        currentUserId={session.user.id}
        isAdmin={isAdmin}
        now={now.toISOString()}
      />
    </div>
  );
}
