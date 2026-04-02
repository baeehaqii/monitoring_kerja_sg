import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter } as any);

const DIVISIONS = [
  "PCD",
  "Penjualan & Pemasaran",
  "Likuiditas",
  "Teknik",
  "Legal & Pengembangan",
  "Keuangan & IT",
];

const MONTH_NAMES = [
  "Januari","Februari","Maret","April","Mei","Juni",
  "Juli","Agustus","September","Oktober","November","Desember",
];

function generateWeeks(year: number, month: number) {
  const daysInMonth = new Date(year, month, 0).getDate();
  const monthName = MONTH_NAMES[month - 1];

  const weeks = [];
  let weekStart = 1;
  let weekNum = 1;

  while (weekStart <= daysInMonth && weekNum <= 5) {
    const startDt = new Date(year, month - 1, weekStart);
    const dayOfWeek = startDt.getDay();
    const daysUntilSunday = dayOfWeek === 0 ? 6 : 7 - dayOfWeek;
    let weekEnd = weekStart + daysUntilSunday;

    if (weekNum === 5 || weekEnd >= daysInMonth) {
      weekEnd = daysInMonth;
    }

    weeks.push({
      weekNumber: weekNum,
      startDay: weekStart,
      endDay: weekEnd,
      label: `${String(weekStart).padStart(2,"0")} - ${String(weekEnd).padStart(2,"0")} ${monthName} ${year}`,
      startDate: new Date(year, month - 1, weekStart),
      endDate: new Date(year, month - 1, weekEnd, 23, 59, 59),
    });

    if (weekEnd >= daysInMonth) break;
    weekStart = weekEnd + 1;
    weekNum++;
  }

  return weeks;
}

async function main() {
  console.log("🌱 Seeding database...");

  const divisionMap: Record<string, string> = {};
  for (const name of DIVISIONS) {
    const d = await prisma.division.upsert({
      where: { name },
      create: { name },
      update: {},
    });
    divisionMap[name] = d.id;
    console.log(`  ✓ Division: ${name}`);
  }

  const periodMonths = [
    { year: 2026, month: 4 },
    { year: 2026, month: 5 },
    { year: 2026, month: 6 },
  ];

  const periodMap: Record<string, string> = {};
  for (const { year, month } of periodMonths) {
    const name = `${MONTH_NAMES[month - 1]} ${year}`;
    const existing = await prisma.period.findUnique({ where: { year_month: { year, month } } });
    if (!existing) {
      const weeks = generateWeeks(year, month);
      const p = await prisma.period.create({
        data: {
          year,
          month,
          name,
          startDate: new Date(year, month - 1, 1),
          endDate: new Date(year, month, 0),
          weeks: { create: weeks },
        },
      });
      periodMap[name] = p.id;
      console.log(`  ✓ Period: ${name} (${weeks.length} weeks)`);
    } else {
      periodMap[name] = existing.id;
      console.log(`  ~ Period exists: ${name}`);
    }
  }

  const adminPassword = await hash("admin123", 12);
  await prisma.user.upsert({
    where: { email: "admin@sapphire.id" },
    create: {
      name: "Administrator",
      email: "admin@sapphire.id",
      password: adminPassword,
      role: "SUPER_ADMIN",
    },
    update: {},
  });
  console.log("  ✓ Super Admin: admin@sapphire.id / admin123");

  const demoUsers = [
    { name: "Manager PCD", email: "pcd@sapphire.id", division: "PCD", role: "ADMIN" },
    { name: "Staff Penjualan", email: "sales@sapphire.id", division: "Penjualan & Pemasaran", role: "MEMBER" },
    { name: "Staff Teknik", email: "teknik@sapphire.id", division: "Teknik", role: "MEMBER" },
  ];

  for (const u of demoUsers) {
    const pw = await hash("password123", 12);
    await prisma.user.upsert({
      where: { email: u.email },
      create: {
        name: u.name,
        email: u.email,
        password: pw,
        role: u.role as "ADMIN" | "MEMBER" | "SUPER_ADMIN",
        divisionId: divisionMap[u.division],
      },
      update: {},
    });
    console.log(`  ✓ User: ${u.email} / password123`);
  }

  const aprilPeriodId = periodMap["April 2026"];
  const pcdId = divisionMap["PCD"];

  if (aprilPeriodId && pcdId) {
    const strategy = await prisma.strategy.upsert({
      where: { divisionId_periodId_number: { divisionId: pcdId, periodId: aprilPeriodId, number: 1 } },
      create: {
        divisionId: pcdId,
        periodId: aprilPeriodId,
        number: 1,
        name: "Peningkatan Efisiensi Operasional",
      },
      update: {},
    });

    const pk = await prisma.programKerja.upsert({
      where: { strategyId_number: { strategyId: strategy.id, number: 1 } },
      create: {
        strategyId: strategy.id,
        number: 1,
        name: "Optimasi Proses Internal",
        raciAccountable: "Direktur Utama",
        raciResponsible: "PCD",
        raciConsulted: "Dir. Bisnis",
        raciInformed: "All",
      },
      update: {},
    });

    const weeks = await prisma.week.findMany({
      where: { periodId: aprilPeriodId },
      orderBy: { weekNumber: "asc" },
    });

    for (let i = 1; i <= 3; i++) {
      const ap = await prisma.actionPlan.upsert({
        where: { programKerjaId_number: { programKerjaId: pk.id, number: i } },
        create: {
          programKerjaId: pk.id,
          number: i,
          name: `Action Plan ${i}: ${["Review SOP", "Training Tim", "Evaluasi KPI"][i - 1]}`,
        },
        update: {},
      });

      const targetWeeks = weeks.slice(i - 1, i + 1);
      for (const w of targetWeeks) {
        await prisma.taskTimeline.upsert({
          where: { actionPlanId_weekId: { actionPlanId: ap.id, weekId: w.id } },
          create: { actionPlanId: ap.id, weekId: w.id, isPlanned: true },
          update: {},
        });
      }
    }
    console.log("  ✓ Sample strategy & proker for PCD April 2026");
  }

  const raciEntries = [
    { role: "Direktur Utama",            type: "ACCOUNTABLE" as const, order: 1 },
    { role: "Dir. Penjualan & Pemasaran",type: "ACCOUNTABLE" as const, order: 2 },
    { role: "Dir. Likuiditas",           type: "ACCOUNTABLE" as const, order: 3 },
    { role: "Dir. Teknik",               type: "ACCOUNTABLE" as const, order: 4 },
    { role: "Dir. Legal & Pengembangan", type: "ACCOUNTABLE" as const, order: 5 },
    { role: "Dir. Keuangan & IT",        type: "ACCOUNTABLE" as const, order: 6 },
    { role: "PCD",                         type: "RESPONSIBLE" as const, order: 1 },
    { role: "Manajer Penjualan & Pemasaran",type: "RESPONSIBLE" as const, order: 2 },
    { role: "Sales",                       type: "RESPONSIBLE" as const, order: 3 },
    { role: "Manajer Likuiditas",          type: "RESPONSIBLE" as const, order: 4 },
    { role: "Staf Likuiditas",             type: "RESPONSIBLE" as const, order: 5 },
    { role: "Manajer Teknik",              type: "RESPONSIBLE" as const, order: 6 },
    { role: "QA",                          type: "RESPONSIBLE" as const, order: 7 },
    { role: "Supervisor Legal",            type: "RESPONSIBLE" as const, order: 8 },
    { role: "Staf Legal",                  type: "RESPONSIBLE" as const, order: 9 },
    { role: "Manajer Keuangan",            type: "RESPONSIBLE" as const, order: 10 },
    { role: "Admin Keuangan",              type: "RESPONSIBLE" as const, order: 11 },
    { role: "Admin Marketing",             type: "RESPONSIBLE" as const, order: 12 },
    { role: "Admin Likuiditas",            type: "RESPONSIBLE" as const, order: 13 },
    { role: "Admin Pembangunan",           type: "RESPONSIBLE" as const, order: 14 },
    { role: "Admin Pajak",                 type: "RESPONSIBLE" as const, order: 15 },
    { role: "Direktur Utama",             type: "CONSULTED" as const, order: 1 },
    { role: "Dir. Bisnis",                type: "CONSULTED" as const, order: 2 },
    { role: "Divisi Penjualan & Pemasaran",type: "CONSULTED" as const, order: 3 },
    { role: "Divisi Likuiditas",          type: "CONSULTED" as const, order: 4 },
    { role: "Divisi Teknik",              type: "CONSULTED" as const, order: 5 },
    { role: "Divisi Legal",               type: "CONSULTED" as const, order: 6 },
    { role: "Divisi Keuangan",            type: "CONSULTED" as const, order: 7 },
    { role: "Direktur Utama",   type: "INFORMED" as const, order: 1 },
    { role: "PCD",              type: "INFORMED" as const, order: 2 },
    { role: "Divisi Likuiditas",type: "INFORMED" as const, order: 3 },
    { role: "Dir. Bisnis",      type: "INFORMED" as const, order: 4 },
    { role: "All",              type: "INFORMED" as const, order: 5 },
  ];

  const existingMatrix = await prisma.raciMatrix.findUnique({
    where: { name: "Matrix RACI Default" },
  });

  if (!existingMatrix) {
    await prisma.raciMatrix.create({
      data: {
        name: "Matrix RACI Default",
        isDefault: true,
        entries: { create: raciEntries },
      },
    });
    console.log("  ✓ RACI Matrix Default dibuat (6A / 15R / 7C / 5I)");
  } else {
    console.log("  ~ RACI Matrix Default sudah ada, skip.");
  }

  console.log("\n✅ Seeding complete!");
  console.log("\nLogin credentials:");
  console.log("  Super Admin : admin@sapphire.id / admin123");
  console.log("  Admin PCD   : pcd@sapphire.id / password123");
  console.log("  Member      : sales@sapphire.id / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
