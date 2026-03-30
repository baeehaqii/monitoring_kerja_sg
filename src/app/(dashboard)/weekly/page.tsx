import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/Header";
import WeeklyViewsClient from "./_components/WeeklyViewsClient";

export default async function WeeklyListPage() {
  const session = await auth();
  if (!session?.user) return null;

  const weeks = await prisma.week.findMany({
    include: {
      period: true,
      _count: { select: { weeklyProgress: true } },
    },
    orderBy: [{ period: { startDate: "asc" } }, { weekNumber: "asc" }],
  });

  return (
    <div>
      <Header title="Weekly Progress" subtitle="Update progress mingguan untuk setiap action plan" />
      <WeeklyViewsClient weeks={weeks} />
    </div>
  );
}
