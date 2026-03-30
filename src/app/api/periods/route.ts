import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const periods = await prisma.period.findMany({
    include: { weeks: { orderBy: { weekNumber: "asc" } } },
    orderBy: [{ year: "asc" }, { month: "asc" }],
  });

  return NextResponse.json(periods);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { year, month } = body;

  if (!year || !month) return NextResponse.json({ error: "Missing year/month" }, { status: 400 });

  const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);
  const name = `${monthNames[month - 1]} ${year}`;

  // Generate weeks for the month
  const weeks = generateWeeks(year, month);

  const period = await prisma.period.create({
    data: {
      year: Number(year),
      month: Number(month),
      name,
      startDate,
      endDate,
      weeks: {
        create: weeks,
      },
    },
    include: { weeks: true },
  });

  return NextResponse.json(period, { status: 201 });
}

function generateWeeks(year: number, month: number) {
  const daysInMonth = new Date(year, month, 0).getDate();
  const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  const monthName = monthNames[month - 1];

  // Divide month into weeks (Mon-Sun boundaries, max 5 weeks)
  const weeks = [];
  let weekStart = 1;
  let weekNum = 1;

  while (weekStart <= daysInMonth) {
    // Find the next Sunday or end of month
    const startDt = new Date(year, month - 1, weekStart);
    let weekEnd = weekStart;

    // End at Sunday (day 0) or end of month
    const dayOfWeek = startDt.getDay(); // 0=Sun, 1=Mon,...
    const daysUntilSunday = dayOfWeek === 0 ? 6 : 7 - dayOfWeek;
    weekEnd = Math.min(weekStart + daysUntilSunday, daysInMonth);

    const label = `${String(weekStart).padStart(2, "0")} - ${String(weekEnd).padStart(2, "0")} ${monthName} ${year}`;

    weeks.push({
      weekNumber: weekNum,
      startDay: weekStart,
      endDay: weekEnd,
      label,
      startDate: new Date(year, month - 1, weekStart),
      endDate: new Date(year, month - 1, weekEnd, 23, 59, 59),
    });

    weekStart = weekEnd + 1;
    weekNum++;
    if (weekNum > 5) break;

    // Last week catches remainder
    if (weekStart <= daysInMonth && weekNum === 5) {
      const finalLabel = `${String(weekStart).padStart(2, "0")} - ${String(daysInMonth).padStart(2, "0")} ${monthName} ${year}`;
      weeks.push({
        weekNumber: 5,
        startDay: weekStart,
        endDay: daysInMonth,
        label: finalLabel,
        startDate: new Date(year, month - 1, weekStart),
        endDate: new Date(year, month - 1, daysInMonth, 23, 59, 59),
      });
      break;
    }
  }

  return weeks;
}
