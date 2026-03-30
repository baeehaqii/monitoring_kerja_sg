"use client";

type Week = { id: string; label: string; weekNumber: number; periodId: string };

interface Props {
  allWeeks: Week[];
  plannedWeekIds: string[];
  periodId: string;
}

export function TimelineGrid({ allWeeks, plannedWeekIds, periodId }: Props) {
  const weeks = allWeeks.filter((w) => w.periodId === periodId);

  return (
    <div className="flex items-center gap-0.5 flex-shrink-0">
      {weeks.map((w) => {
        const planned = plannedWeekIds.includes(w.id);
        return (
          <div
            key={w.id}
            title={`W${w.weekNumber}: ${w.label}`}
            className={`w-4 h-4 rounded-sm border ${
              planned
                ? "bg-[#0f52ba] border-[#0d47a1]"
                : "bg-slate-100 border-slate-200"
            }`}
          />
        );
      })}
    </div>
  );
}
