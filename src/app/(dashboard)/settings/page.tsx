import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { SettingsClient } from "@/components/SettingsClient";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) return null;
  if (!["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) redirect("/");

  const [periods, divisions] = await Promise.all([
    prisma.period.findMany({
      include: {
        weeks: { orderBy: { weekNumber: "asc" } },
        _count: { select: { strategies: true } },
      },
      orderBy: [{ year: "asc" }, { month: "asc" }],
    }),
    prisma.division.findMany({
      include: { _count: { select: { users: true, strategies: true } } },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div>
      <Header title="Pengaturan" subtitle="Kelola periode, minggu, dan divisi" />
      <SettingsClient periods={JSON.parse(JSON.stringify(periods))} divisions={JSON.parse(JSON.stringify(divisions))} />
    </div>
  );
}
