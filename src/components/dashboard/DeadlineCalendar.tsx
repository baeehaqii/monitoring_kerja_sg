"use client";

import * as React from "react";
import { Calendar, CalendarDayButton } from "@/components/ui/Calendar";
import { cn, formatDate } from "@/lib/utils";
import { CalendarDays, Target, Clock, CheckCircle2, AlertTriangle, ChevronDown } from "lucide-react";

type CalendarType = "deadline" | "event";

// TODO: Tambahkan tipe EventItem untuk kalender event dari divisi Sales & Markom
// export type EventItem = {
//   id: string;
//   title: string;        // Nama event
//   date: string;         // ISO date
//   endDate?: string;     // ISO date (opsional, untuk event multi-hari)
//   division: string;     // Divisi (Sales / Markom)
//   description?: string;
// };

export type DeadlineItem = {
  id: string;
  name: string;          // ActionPlan name
  targetDate: string;    // ISO date
  status: string;        // DONE | ON_PROGRESS | NOT_STARTED | DELAY
  programKerja: string;  // ProgramKerja name
  division: string;      // Division name
  project?: string;      // Project name
};

interface DeadlineCalendarProps {
  deadlines: DeadlineItem[];
}

const STATUS_STYLE: Record<string, {
  dot: string;
  bg: string;
  text: string;
  label: string;
  icon: React.ElementType;
}> = {
  DONE: {
    dot: "bg-success",
    bg: "bg-success/10",
    text: "text-success",
    label: "Selesai",
    icon: CheckCircle2,
  },
  ON_PROGRESS: {
    dot: "bg-primary",
    bg: "bg-primary/10",
    text: "text-primary",
    label: "On Progress",
    icon: Clock,
  },
  DELAY: {
    dot: "bg-error",
    bg: "bg-error/10",
    text: "text-error",
    label: "Delay",
    icon: AlertTriangle,
  },
  NOT_STARTED: {
    dot: "bg-secondary/40",
    bg: "bg-muted",
    text: "text-secondary",
    label: "Belum Mulai",
    icon: Target,
  },
};



export function DeadlineCalendar({ deadlines }: DeadlineCalendarProps) {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(undefined);
  const [calendarType, setCalendarType] = React.useState<CalendarType>("deadline");

  // Group deadline per tanggal
  const deadlinesByDate = React.useMemo(() => {
    const map = new Map<string, DeadlineItem[]>();
    for (const d of deadlines) {
      const dateKey = d.targetDate.slice(0, 10); // YYYY-MM-DD
      const arr = map.get(dateKey) ?? [];
      arr.push(d);
      map.set(dateKey, arr);
    }
    return map;
  }, [deadlines]);



  // Modifiers untuk react-day-picker
  const modifiers = React.useMemo(() => {
    const hasDeadline: Date[] = [];
    const hasDelay: Date[] = [];
    const allDone: Date[] = [];

    for (const [dateKey, items] of deadlinesByDate) {
      const date = new Date(dateKey);
      hasDeadline.push(date);

      const anyDelay = items.some((i) => i.status === "DELAY");
      const everyDone = items.every((i) => i.status === "DONE");

      if (anyDelay) hasDelay.push(date);
      else if (everyDone) allDone.push(date);
    }

    return { hasDeadline, hasDelay, allDone };
  }, [deadlinesByDate]);

  // Items untuk tanggal yang dipilih
  const selectedItems = React.useMemo(() => {
    if (!selectedDate) return [];
    const key = selectedDate.toISOString().slice(0, 10);
    return deadlinesByDate.get(key) ?? [];
  }, [selectedDate, deadlinesByDate]);

  // Default month (bulan sekarang)
  const today = new Date();

  return (
    <div className="flex flex-col rounded-2xl border border-border bg-white animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-6 pb-2">
        <div className="flex items-center gap-2.5">
          <div className="size-9 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
            <CalendarDays className="size-[18px] text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-foreground">
              {calendarType === "deadline" ? "Kalender Deadline" : "Kalender Event"}
            </h3>
            <p className="text-xs text-secondary">
              {calendarType === "deadline"
                ? "Deadline task dari Program Kerja & Weekly Progress"
                : "Jadwal event dari divisi Sales & Markom"}
            </p>
          </div>
        </div>
        {/* Legend + Calendar Type Dropdown */}
        <div className="hidden md:flex items-center gap-3">
          {calendarType === "deadline" ? (
            <>
              <span className="flex items-center gap-1.5 text-[10px] text-secondary">
                <span className="size-2 rounded-full bg-primary" /> Aktif
              </span>
              <span className="flex items-center gap-1.5 text-[10px] text-secondary">
                <span className="size-2 rounded-full bg-error" /> Delay
              </span>
              <span className="flex items-center gap-1.5 text-[10px] text-secondary">
                <span className="size-2 rounded-full bg-success" /> Selesai
              </span>
              <span className="w-px h-3 bg-border" />
            </>
          ) : (
            <>
              <span className="flex items-center gap-1.5 text-[10px] text-secondary">
                <span className="size-2 rounded-full bg-orange-400" /> Markom
              </span>
              <span className="flex items-center gap-1.5 text-[10px] text-secondary">
                <span className="size-2 rounded-full bg-violet-500" /> Sales
              </span>
              <span className="w-px h-3 bg-border" />
            </>
          )}
          {/* Dropdown jenis kalender */}
          <div className="relative">
            <select
              value={calendarType}
              onChange={(e) => {
                setCalendarType(e.target.value as CalendarType);
                setSelectedDate(undefined);
              }}
              className="appearance-none text-[10px] font-medium text-foreground bg-muted border border-border rounded-lg pl-2.5 pr-6 py-1 cursor-pointer hover:bg-muted/70 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="deadline">Deadline</option>
              <option value="event">Event</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 size-3 text-secondary" />
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* Calendar */}
        <div className="px-3 pb-4">
          {/* TODO: Saat calendarType === 'event', gunakan data events dari API divisi Sales & Markom
               - Fetch dari endpoint baru, misal: GET /api/events?division=sales,markom
               - Map EventItem ke modifiers & deadlinesByDate agar DayButton & sidebar tetap bisa dipakai
               - Untuk sementara tampilkan pesan kosong / placeholder
          */}
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            defaultMonth={today}
            captionLayout="dropdown"
            modifiers={calendarType === "deadline" ? modifiers : { hasDeadline: [], hasDelay: [], allDone: [] }}
            modifiersClassNames={{
              hasDeadline: "deadline-marker",
              hasDelay: "deadline-delay",
              allDone: "deadline-done",
            }}
            className="[--cell-size:--spacing(10)] md:[--cell-size:--spacing(11)]"
            formatters={{
              formatMonthDropdown: (date) =>
                date.toLocaleString("id-ID", { month: "long" }),
            }}
            components={{
              DayButton: ({ children, modifiers: mods, day, ...props }) => {
                const dateKey = day.date.toISOString().slice(0, 10);
                // TODO: Saat calendarType === 'event', ganti sumber data ke eventsByDate
                const items = calendarType === "deadline" ? deadlinesByDate.get(dateKey) : undefined;
                const hasItems = items && items.length > 0;
                const anyDelay = items?.some((i) => i.status === "DELAY");
                const everyDone = items?.every((i) => i.status === "DONE");

                return (
                  <CalendarDayButton day={day} modifiers={mods} {...props}>
                    <span className="flex flex-col items-center gap-0.5">
                      {children}
                      {!mods.outside && hasItems && (
                        <span className="flex items-center gap-0.5">
                          {items.length <= 3 ? (
                            items.map((item, idx) => (
                              <span
                                key={idx}
                                className={cn(
                                  "size-1 rounded-full",
                                  item.status === "DELAY"
                                    ? "bg-error"
                                    : item.status === "DONE"
                                      ? "bg-success"
                                      : "bg-primary"
                                )}
                              />
                            ))
                          ) : (
                            <>
                              <span
                                className={cn(
                                  "size-1 rounded-full",
                                  anyDelay
                                    ? "bg-error"
                                    : everyDone
                                      ? "bg-success"
                                      : "bg-primary"
                                )}
                              />
                              <span className="text-[7px] leading-none text-secondary font-medium">
                                +{items.length - 1}
                              </span>
                            </>
                          )}
                        </span>
                      )}
                    </span>
                  </CalendarDayButton>
                );
              },
            }}
          />
        </div>

        {/* Task list sidebar */}
        <div className="flex-1 border-t lg:border-t-0 lg:border-l border-border min-w-0">
          <div className="px-5 py-4">
            <h4 className="text-sm font-semibold text-foreground mb-1">
              {selectedDate
                ? formatDate(selectedDate)
                : "Pilih tanggal"}
            </h4>
            <p className="text-xs text-secondary mb-3">
              {selectedDate
                ? calendarType === "deadline"
                  ? selectedItems.length > 0
                    ? `${selectedItems.length} task deadline`
                    : "Tidak ada deadline"
                  : "Tidak ada event" // TODO: Ganti dengan data event
                : "Klik tanggal di kalender untuk melihat deadline"}
            </p>
          </div>

          <div className="px-5 pb-5 flex flex-col gap-2 max-h-[320px] overflow-y-auto scrollbar-hide">
            {/* TODO: Saat calendarType === 'event', render daftar EventItem di sini (Sales & Markom) */}
            {calendarType === "event" && selectedDate && (
              <div className="flex flex-col items-center justify-center py-6 gap-2">
                <div className="size-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <CalendarDays className="size-5 text-primary" />
                </div>
                <p className="text-xs text-secondary text-center">
                  Kalender event akan segera tersedia
                </p>
              </div>
            )}
            {calendarType === "deadline" && selectedItems.length === 0 && selectedDate && (
              <div className="flex flex-col items-center justify-center py-6 gap-2">
                <div className="size-10 bg-muted rounded-full flex items-center justify-center">
                  <CalendarDays className="size-5 text-secondary" />
                </div>
                <p className="text-xs text-secondary">
                  Tidak ada deadline di tanggal ini
                </p>
              </div>
            )}

            {calendarType === "deadline" && !selectedDate && (
              <div className="flex flex-col items-center justify-center py-6 gap-2">
                <div className="size-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Target className="size-5 text-primary" />
                </div>
                <p className="text-xs text-secondary text-center">
                  Pilih tanggal untuk melihat daftar task
                </p>
              </div>
            )}

            {calendarType === "deadline" && selectedItems.map((item) => {
              const style =
                STATUS_STYLE[item.status] ?? STATUS_STYLE.NOT_STARTED;
              const Icon = style.icon;

              return (
                <div
                  key={item.id}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-xl border border-border",
                    "hover:bg-muted/50 transition-all duration-200 group"
                  )}
                >
                  <div
                    className={cn(
                      "size-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
                      style.bg
                    )}
                  >
                    <Icon className={cn("size-4", style.text)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                      {item.name}
                    </p>
                    <p className="text-xs text-secondary truncate mt-0.5">
                      {item.division} · {item.programKerja}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span
                        className={cn(
                          "text-[10px] font-semibold px-2 py-0.5 rounded-full",
                          style.bg,
                          style.text
                        )}
                      >
                        {style.label}
                      </span>
                      {item.project && (
                        <span className="text-[10px] text-secondary bg-muted px-2 py-0.5 rounded-full">
                          {item.project}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
