import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter } as any);

// ── Divisions ──────────────────────────────────────────────────────────────
const DIVISIONS = [
  "PCD",
  "Penjualan & Pemasaran",
  "Likuiditas",
  "Teknik",
  "Legal & Pengembangan",
  "Keuangan & IT",
];

// ── Projects per cluster ───────────────────────────────────────────────────
type ClusterType = "GRAHA" | "GRIYA" | "SGM";

const PROJECTS: { name: string; cluster: string; clusterType: ClusterType }[] = [
  // GRAHA I
  { name: "Sapphire Townhouse Bumiayu",cluster: "GRAHA I",clusterType: "GRAHA" },
  { name: "Samara Bumiayu",cluster: "GRAHA I",clusterType: "GRAHA" },
  { name: "Sapphire Residence Ajibarang",cluster: "GRAHA I",clusterType: "GRAHA" },
  // GRAHA II
  { name: "Sapphire Madani Purwokerto",cluster: "GRAHA II",clusterType: "GRAHA" },
  { name: "Sapphire Mansion Purwokerto",cluster: "GRAHA II",clusterType: "GRAHA" },
  { name: "Sapphire Riverside Purwokerto",cluster: "GRAHA II",clusterType: "GRAHA" },
  // GRAHA III
  { name: "Sapphire Residence Sumbang",cluster: "GRAHA III",clusterType: "GRAHA" },
  { name: "Sapphire Townhouse Purbalingga",cluster: "GRAHA III",clusterType: "GRAHA" },
  // GRAHA IV
  { name: "Samara Wiradadi",cluster: "GRAHA IV",clusterType: "GRAHA" },
  { name: "Samara Pegalongan",cluster: "GRAHA IV",clusterType: "GRAHA" },
  { name: "Sapphire Serenity",cluster: "GRAHA IV",clusterType: "GRAHA" },

  // GRIYA I
  { name: "Sapphire Aesthetic Slawi",cluster: "GRIYA I",clusterType: "GRIYA" },
  { name: "Sapphire Townhouse Slawi",cluster: "GRIYA I",clusterType: "GRIYA" },
  { name: "Samara Penusupan",cluster: "GRIYA I",clusterType: "GRIYA" },
  // GRIYA II
  { name: "Sapphire Residence Tegal",cluster: "GRIYA II",clusterType: "GRIYA" },
  { name: "Sapphire Aesthetic Pemalang",cluster: "GRIYA II",clusterType: "GRIYA" },
  { name: "Sapphire Townhouse Pekalongan",cluster: "GRIYA II",clusterType: "GRIYA" },
  { name: "Sapphire Residence Kajen",cluster: "GRIYA II",clusterType: "GRIYA" },
  // GRIYA III
  { name: "Sapphire Aesthetic Brebes",cluster: "GRIYA III",clusterType: "GRIYA" },
  { name: "Samara Klampok",cluster: "GRIYA III",clusterType: "GRIYA" },
  // GRIYA IV
  { name: "Sapphire Madani Tegal",cluster: "GRIYA IV",clusterType: "GRIYA" },

  // SGM
  { name: "Sapphire Serenity Adiwerna",cluster: "SGM",clusterType: "SGM" },
];

// ── Period helpers ─────────────────────────────────────────────────────────
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
    if (weekNum === 5 || weekEnd >= daysInMonth) weekEnd = daysInMonth;

    weeks.push({
      weekNumber: weekNum,
      startDay: weekStart,
      endDay: weekEnd,
      label: `${String(weekStart).padStart(2,"0")} - ${String(weekEnd).padStart(2,"0")} ${monthName} ${year}`,
      startDate: new Date(year, month - 1, weekStart),
      endDate:   new Date(year, month - 1, weekEnd, 23, 59, 59),
    });

    if (weekEnd >= daysInMonth) break;
    weekStart = weekEnd + 1;
    weekNum++;
  }
  return weeks;
}

// ── Main ───────────────────────────────────────────────────────────────────
async function main() {
  console.log("🌱 Seeding database...\n");

  // 1. Divisions
  console.log("── Divisions");
  const divisionMap: Record<string, string> = {};
  for (const name of DIVISIONS) {
    const d = await prisma.division.upsert({ where: { name }, create: { name }, update: {} });
    divisionMap[name] = d.id;
    console.log(`  ✓ ${name}`);
  }

  // 2. Periods (Apr–Jun 2026)
  console.log("\n── Periods");
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
        data: { year, month, name, startDate: new Date(year, month - 1, 1), endDate: new Date(year, month, 0), weeks: { create: weeks } },
      });
      periodMap[name] = p.id;
      console.log(`  ✓ ${name} (${weeks.length} minggu)`);
    } else {
      periodMap[name] = existing.id;
      console.log(`  ~ ${name} sudah ada`);
    }
  }

  // 3. Projects
  console.log("\n── Projects");
  const projectMap: Record<string, string> = {};
  for (const proj of PROJECTS) {
    const p = await prisma.project.upsert({
      where: { name: proj.name },
      create: proj,
      update: {},
    });
    projectMap[proj.name] = p.id;
    console.log(`  ✓ [${proj.clusterType}] ${proj.cluster} › ${proj.name}`);
  }

  // 4. Users
  console.log("\n── Users");

  // Super Admin
  await prisma.user.upsert({
    where: { email: "admin@siproper.com" },
    create: { name: "Administrator", email: "admin@siproper.com", role: "SUPER_ADMIN" },
    update: {},
  });
  console.log("  ✓ SUPER_ADMIN  : admin@siproper.com");

  // Demo users per cluster role
  const demoUsers: {
    name: string; email: string;
    role: "DIREKTUR_BISNIS" | "GENERAL_MANAGER" | "MEMBER" | "ADMIN";
    division: string;
    projects: string[];  // project names
  }[] = [
    // GRAHA cluster
    {
      name: "Dir. Bisnis GRAHA",
      email: "dirgraha@sapphire.id",

      role: "DIREKTUR_BISNIS",
      division: "Penjualan & Pemasaran",
      projects: [
        "Sapphire Townhouse Bumiayu","Samara Bumiayu","Sapphire Residence Ajibarang",
        "Sapphire Madani Purwokerto","Sapphire Mansion Purwokerto","Sapphire Riverside Purwokerto",
        "Sapphire Residence Sumbang","Sapphire Townhouse Purbalingga",
        "Samara Wiradadi","Samara Pegalongan","Sapphire Serenity",
      ],
    },
    {
      name: "GM GRAHA I",
      email: "gm.graha1@sapphire.id",

      role: "GENERAL_MANAGER",
      division: "Penjualan & Pemasaran",
      projects: ["Sapphire Townhouse Bumiayu","Samara Bumiayu","Sapphire Residence Ajibarang"],
    },
    {
      name: "GM GRAHA II",
      email: "gm.graha2@sapphire.id",

      role: "GENERAL_MANAGER",
      division: "Penjualan & Pemasaran",
      projects: ["Sapphire Madani Purwokerto","Sapphire Mansion Purwokerto","Sapphire Riverside Purwokerto"],
    },
    {
      name: "GM GRAHA III",
      email: "gm.graha3@sapphire.id",

      role: "GENERAL_MANAGER",
      division: "Penjualan & Pemasaran",
      projects: ["Sapphire Residence Sumbang","Sapphire Townhouse Purbalingga"],
    },
    {
      name: "GM GRAHA IV",
      email: "gm.graha4@sapphire.id",

      role: "GENERAL_MANAGER",
      division: "Penjualan & Pemasaran",
      projects: ["Samara Wiradadi","Samara Pegalongan","Sapphire Serenity"],
    },

    // GRIYA cluster
    {
      name: "Dir. Bisnis GRIYA",
      email: "dirgriya@sapphire.id",

      role: "DIREKTUR_BISNIS",
      division: "Penjualan & Pemasaran",
      projects: [
        "Sapphire Aesthetic Slawi","Sapphire Townhouse Slawi","Samara Penusupan",
        "Sapphire Residence Tegal","Sapphire Aesthetic Pemalang","Sapphire Townhouse Pekalongan","Sapphire Residence Kajen",
        "Sapphire Aesthetic Brebes","Samara Klampok",
        "Sapphire Madani Tegal",
      ],
    },
    {
      name: "GM GRIYA I",
      email: "gm.griya1@sapphire.id",

      role: "GENERAL_MANAGER",
      division: "Penjualan & Pemasaran",
      projects: ["Sapphire Aesthetic Slawi","Sapphire Townhouse Slawi","Samara Penusupan"],
    },
    {
      name: "GM GRIYA II",
      email: "gm.griya2@sapphire.id",

      role: "GENERAL_MANAGER",
      division: "Penjualan & Pemasaran",
      projects: ["Sapphire Residence Tegal","Sapphire Aesthetic Pemalang","Sapphire Townhouse Pekalongan","Sapphire Residence Kajen"],
    },
    {
      name: "GM GRIYA III",
      email: "gm.griya3@sapphire.id",

      role: "GENERAL_MANAGER",
      division: "Penjualan & Pemasaran",
      projects: ["Sapphire Aesthetic Brebes","Samara Klampok"],
    },
    {
      name: "GM GRIYA IV",
      email: "gm.griya4@sapphire.id",

      role: "GENERAL_MANAGER",
      division: "Penjualan & Pemasaran",
      projects: ["Sapphire Madani Tegal"],
    },

    // SGM
    {
      name: "GM SGM",
      email: "gm.sgm@sapphire.id",

      role: "GENERAL_MANAGER",
      division: "Penjualan & Pemasaran",
      projects: ["Sapphire Serenity Adiwerna"],
    },

    // Generic staff / demo
    {
      name: "Staff PCD",
      email: "pcd@sapphire.id",

      role: "MEMBER",
      division: "PCD",
      projects: [],
    },
    {
      name: "Staff Teknik",
      email: "teknik@sapphire.id",

      role: "MEMBER",
      division: "Teknik",
      projects: ["Sapphire Townhouse Bumiayu","Sapphire Madani Purwokerto"],
    },
  ];

  for (const u of demoUsers) {
    const created = await prisma.user.upsert({
      where: { email: u.email },
      create: {
        name: u.name,
        email: u.email,
        role: u.role,
        divisionId: divisionMap[u.division] ?? null,
      },
      update: {},
    });

    // Assign projects
    for (const projName of u.projects) {
      const projectId = projectMap[projName];
      if (!projectId) continue;
      await prisma.userProject.upsert({
        where: { userId_projectId: { userId: created.id, projectId } },
        create: { userId: created.id, projectId },
        update: {},
      });
    }

    const roleLabel = u.role.padEnd(16);
    const projCount = u.projects.length > 0 ? ` (${u.projects.length} proyek)` : "";
    console.log(`  ✓ ${roleLabel}: ${u.email}${projCount}`);
  }

  // 5. Sample strategy (PCD – April 2026, unassigned project so SUPER_ADMIN only)
  console.log("\n── Sample data");
  const aprilPeriodId = periodMap["April 2026"];
  const pcdId = divisionMap["PCD"];
  if (aprilPeriodId && pcdId) {
    const strategy = await prisma.strategy.upsert({
      where: { divisionId_periodId_number: { divisionId: pcdId, periodId: aprilPeriodId, number: 1 } },
      create: { divisionId: pcdId, periodId: aprilPeriodId, number: 1, name: "Peningkatan Efisiensi Operasional" },
      update: {},
    });
    const pk = await prisma.programKerja.upsert({
      where: { strategyId_number: { strategyId: strategy.id, number: 1 } },
      create: {
        strategyId: strategy.id, number: 1, name: "Optimasi Proses Internal",
        raciAccountable: "Direktur Utama", raciResponsible: "PCD",
        raciConsulted: "Dir. Bisnis", raciInformed: "All",
      },
      update: {},
    });
    const weeks = await prisma.week.findMany({ where: { periodId: aprilPeriodId }, orderBy: { weekNumber: "asc" } });
    for (let i = 1; i <= 3; i++) {
      const ap = await prisma.actionPlan.upsert({
        where: { programKerjaId_number: { programKerjaId: pk.id, number: i } },
        create: { programKerjaId: pk.id, number: i, name: `Action Plan ${i}: ${["Review SOP","Training Tim","Evaluasi KPI"][i-1]}` },
        update: {},
      });
      for (const w of weeks.slice(i - 1, i + 1)) {
        await prisma.taskTimeline.upsert({
          where: { actionPlanId_weekId: { actionPlanId: ap.id, weekId: w.id } },
          create: { actionPlanId: ap.id, weekId: w.id, isPlanned: true },
          update: {},
        });
      }
    }
    console.log("  ✓ Sample strategy & proker untuk PCD – April 2026");
  }

  // 6. RACI Matrix default
  const raciEntries = [
    { role: "Direktur Utama",              type: "ACCOUNTABLE" as const, order: 1 },
    { role: "Dir. Penjualan & Pemasaran",  type: "ACCOUNTABLE" as const, order: 2 },
    { role: "Dir. Likuiditas",             type: "ACCOUNTABLE" as const, order: 3 },
    { role: "Dir. Teknik",                 type: "ACCOUNTABLE" as const, order: 4 },
    { role: "Dir. Legal & Pengembangan",   type: "ACCOUNTABLE" as const, order: 5 },
    { role: "Dir. Keuangan & IT",          type: "ACCOUNTABLE" as const, order: 6 },
    { role: "PCD",                          type: "RESPONSIBLE" as const, order: 1 },
    { role: "Manajer Penjualan & Pemasaran",type: "RESPONSIBLE" as const, order: 2 },
    { role: "Sales",                        type: "RESPONSIBLE" as const, order: 3 },
    { role: "Manajer Likuiditas",           type: "RESPONSIBLE" as const, order: 4 },
    { role: "Staf Likuiditas",              type: "RESPONSIBLE" as const, order: 5 },
    { role: "Manajer Teknik",               type: "RESPONSIBLE" as const, order: 6 },
    { role: "QA",                           type: "RESPONSIBLE" as const, order: 7 },
    { role: "Supervisor Legal",             type: "RESPONSIBLE" as const, order: 8 },
    { role: "Staf Legal",                   type: "RESPONSIBLE" as const, order: 9 },
    { role: "Manajer Keuangan",             type: "RESPONSIBLE" as const, order: 10 },
    { role: "Admin Keuangan",               type: "RESPONSIBLE" as const, order: 11 },
    { role: "Admin Marketing",              type: "RESPONSIBLE" as const, order: 12 },
    { role: "Admin Likuiditas",             type: "RESPONSIBLE" as const, order: 13 },
    { role: "Admin Pembangunan",            type: "RESPONSIBLE" as const, order: 14 },
    { role: "Admin Pajak",                  type: "RESPONSIBLE" as const, order: 15 },
    { role: "Direktur Utama",              type: "CONSULTED" as const, order: 1 },
    { role: "Dir. Bisnis",                 type: "CONSULTED" as const, order: 2 },
    { role: "Divisi Penjualan & Pemasaran",type: "CONSULTED" as const, order: 3 },
    { role: "Divisi Likuiditas",           type: "CONSULTED" as const, order: 4 },
    { role: "Divisi Teknik",               type: "CONSULTED" as const, order: 5 },
    { role: "Divisi Legal",                type: "CONSULTED" as const, order: 6 },
    { role: "Divisi Keuangan",             type: "CONSULTED" as const, order: 7 },
    { role: "Direktur Utama",    type: "INFORMED" as const, order: 1 },
    { role: "PCD",               type: "INFORMED" as const, order: 2 },
    { role: "Divisi Likuiditas", type: "INFORMED" as const, order: 3 },
    { role: "Dir. Bisnis",       type: "INFORMED" as const, order: 4 },
    { role: "All",               type: "INFORMED" as const, order: 5 },
  ];

  const existingMatrix = await prisma.raciMatrix.findUnique({ where: { name: "Matrix RACI Default" } });
  if (!existingMatrix) {
    await prisma.raciMatrix.create({
      data: { name: "Matrix RACI Default", isDefault: true, entries: { create: raciEntries } },
    });
    console.log("  ✓ RACI Matrix Default (6A / 15R / 7C / 5I)");
  } else {
    console.log("  ~ RACI Matrix Default sudah ada");
  }

  console.log("\n✅ Seeding selesai!\n");
  console.log("Kredensial login:");
  console.log("  Super Admin       : admin@sapphire.id / admin123");
  console.log("  Dir. Bisnis GRAHA : dirgraha@sapphire.id / password123");
  console.log("  Dir. Bisnis GRIYA : dirgriya@sapphire.id / password123");
  console.log("  GM GRAHA I        : gm.graha1@sapphire.id / password123");
  console.log("  GM GRIYA I        : gm.griya1@sapphire.id / password123");
  console.log("  GM SGM            : gm.sgm@sapphire.id / password123");
  console.log("  Staff PCD         : pcd@sapphire.id / password123");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
