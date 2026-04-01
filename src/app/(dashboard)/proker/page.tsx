import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/Header";
import { ProkerPageClient } from "@/components/proker/ProkerPageClient";
import { divisionStrategyFilter } from "@/lib/permissions";

async function getProkerData(divisionId: string | null, role: string) {
  const user = { id: "", role, divisionId };

  const [divisions, periods, strategies, raciMatrix] = await Promise.all([
    prisma.division.findMany({ orderBy: { name: "asc" } }),
    prisma.period.findMany({
      include: { weeks: { orderBy: { weekNumber: "asc" } } },
      orderBy: [{ year: "asc" }, { month: "asc" }],
    }),
    prisma.strategy.findMany({
      where: divisionStrategyFilter(user),
      include: {
        division: true,
        period: { include: { weeks: { orderBy: { weekNumber: "asc" } } } },
        programKerja: {
          include: {
            actionPlans: {
              include: {
                taskTimelines: { include: { week: true } },
                weeklyProgress: {
                  orderBy: { updatedAt: "desc" },
                  take: 1,
                  select: { status: true },
                },
              },
              orderBy: { number: "asc" },
            },
          },
          orderBy: { number: "asc" },
        },
      },
      orderBy: [{ period: { startDate: "asc" } }, { number: "asc" }],
    }),
    // Ambil matrix RACI default (isDefault=true), fallback ke yang pertama
    prisma.raciMatrix.findFirst({
      where: { isDefault: true },
      include: { entries: { orderBy: [{ type: "asc" }, { order: "asc" }] } },
    }).then(async (m) => {
      if (m) return m;
      return prisma.raciMatrix.findFirst({
        include: { entries: { orderBy: [{ type: "asc" }, { order: "asc" }] } },
      });
    }),
  ]);

  return { divisions, periods, strategies, raciMatrix };
}

export default async function ProkerPage() {
  const session = await auth();
  if (!session?.user) return null;

  const { divisions, periods, strategies, raciMatrix } = await getProkerData(
    session.user.divisionId,
    session.user.role
  );

  return (
    <div>
      <Header
        title="Program Kerja"
        subtitle="Kelola strategi, program kerja, dan action plan"
      />
      <ProkerPageClient
        strategies={JSON.parse(JSON.stringify(strategies))}
        divisions={JSON.parse(JSON.stringify(divisions))}
        periods={JSON.parse(JSON.stringify(periods))}
        raciMatrix={JSON.parse(JSON.stringify(raciMatrix ?? { entries: [] }))}
        userRole={session.user.role}
        userDivisionId={session.user.divisionId}
      />
    </div>
  );
}
