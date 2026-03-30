"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  addMonths, 
  subMonths, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  startOfWeek, 
  endOfWeek,
  isToday,
  isWithinInterval,
  parseISO
} from "date-fns";
import { id } from "date-fns/locale";
import { 
  CalendarDays, 
  ChevronRight, 
  CheckCircle2, 
  Clock, 
  LayoutList, 
  CalendarIcon, 
  LayoutGrid,
  ChevronLeft,
  GanttChart,
  Rows
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { formatDate } from "@/lib/utils";

type WeekItem = {
  id: string;
  weekNumber: number;
  startDate: string | Date; // Depending on passing from server
  endDate: string | Date;
  label: string;
  period: {
    id: string;
    name: string;
  };
  _count: {
    weeklyProgress: number;
  };
};

export default function WeeklyViewsClient({ weeks }: { weeks: WeekItem[] }) {
  const [view, setView] = useState<"card" | "list" | "calendar" | "timeline">("card");
  const [currentDate, setCurrentDate] = useState(new Date());

  const today = new Date();

  // Parse dates correctly
  const parsedWeeks = weeks.map(w => ({
    ...w,
    parsedStart: typeof w.startDate === 'string' ? parseISO(w.startDate) : w.startDate,
    parsedEnd: typeof w.endDate === 'string' ? parseISO(w.endDate) : w.endDate,
  }));

  const groupedByPeriod = parsedWeeks.reduce<Record<string, typeof parsedWeeks>>(
    (acc, w) => {
      const key = w.period.name;
      if (!acc[key]) acc[key] = [];
      acc[key].push(w);
      return acc;
    },
    {}
  );

  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  // CARD VIEW
  const renderCardView = () => {
    if (Object.keys(groupedByPeriod).length === 0) {
      return (
        <Card>
          <p className="text-center text-slate-400 py-10 text-sm">
            Belum ada periode. Tambahkan periode di Pengaturan.
          </p>
        </Card>
      );
    }

    return (
      <div className="space-y-6 mt-4">
        {Object.entries(groupedByPeriod).map(([periodName, periodWeeks]) => (
          <div key={periodName}>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <CalendarDays className="w-3.5 h-3.5" /> {periodName}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {periodWeeks.map((week) => {
                const isCurrent = today >= week.parsedStart && today <= week.parsedEnd;
                const isPast = today > week.parsedEnd;
                const hasProgress = week._count.weeklyProgress > 0;

                return (
                  <Link key={week.id} href={`/weekly/${week.id}`}>
                    <div
                      className={`p-4 rounded-xl border transition-all hover:shadow-md cursor-pointer ${
                        isCurrent
                          ? "bg-[#0f52ba] text-white border-[#0d47a1] shadow-sm"
                          : "bg-white border-slate-200 hover:border-[#0f52ba]/30"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className={`text-sm font-bold ${isCurrent ? "text-white" : "text-slate-900"}`}>
                            Week {week.weekNumber}
                          </p>
                          <p className={`text-xs mt-0.5 ${isCurrent ? "text-white/70" : "text-slate-500"}`}>
                            {week.label}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {hasProgress && (
                            <CheckCircle2 className={`w-4 h-4 ${isCurrent ? "text-white/70" : "text-green-500"}`} />
                          )}
                          {isCurrent && (
                            <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full font-medium">
                              Minggu Ini
                            </span>
                          )}
                          <ChevronRight className={`w-4 h-4 ${isCurrent ? "text-white/70" : "text-slate-300"}`} />
                        </div>
                      </div>
                      <div className={`mt-2 flex items-center gap-1 text-xs ${isCurrent ? "text-white/60" : "text-slate-400"}`}>
                        {isPast ? (
                          <><Clock className="w-3 h-3" /> {format(week.parsedStart, "d MMM yyyy", { locale: id })} – {format(week.parsedEnd, "d MMM yyyy", { locale: id })}</>
                        ) : (
                          <><CalendarDays className="w-3 h-3" /> {format(week.parsedStart, "d MMM yyyy", { locale: id })} – {format(week.parsedEnd, "d MMM yyyy", { locale: id })}</>
                        )}
                      </div>
                      {hasProgress && (
                        <p className={`text-xs mt-1 ${isCurrent ? "text-white/60" : "text-slate-400"}`}>
                          {week._count.weeklyProgress} progress diinput
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // LIST VIEW (A simple table / list variant if image 2 meant list, otherwise Timeline is image 1)
  const renderListView = () => {
    return (
      <div className="space-y-6 mt-4">
        {Object.entries(groupedByPeriod).map(([periodName, periodWeeks]) => (
          <Card key={periodName} className="p-0 overflow-hidden">
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex items-center">
              <CalendarDays className="w-4 h-4 text-slate-500 mr-2" />
              <h3 className="font-semibold text-slate-700">{periodName}</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {periodWeeks.map(week => {
                const isCurrent = today >= week.parsedStart && today <= week.parsedEnd;
                const hasProgress = week._count.weeklyProgress > 0;
                
                return (
                  <Link key={week.id} href={`/weekly/${week.id}`} className="block hover:bg-slate-50 transition-colors">
                    <div className="px-4 py-3 sm:flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-2 h-2 rounded-full ${isCurrent ? 'bg-[#0f52ba]' : hasProgress ? 'bg-green-500' : 'bg-slate-300'}`} />
                        <div>
                          <p className="font-medium text-slate-900 text-sm">Week {week.weekNumber}</p>
                          <p className="text-xs text-slate-500">{week.label}</p>
                        </div>
                      </div>
                      <div className="mt-2 sm:mt-0 flex items-center sm:justify-end gap-6 text-sm">
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{format(week.parsedStart, "d MMM", { locale: id })} - {format(week.parsedEnd, "d MMM yyyy", { locale: id })}</span>
                        </div>
                        <div className="w-24 text-right">
                          {hasProgress ? (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                              <CheckCircle2 className="w-3 h-3" /> {week._count.weeklyProgress} items
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400">0 items</span>
                          )}
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </Card>
        ))}
      </div>
    );
  };

  // CALENDAR VIEW (Grid Month)
  const renderCalendarView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday start
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
    
    const dateFormat = "d";
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    const weekDays = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

    return (
      <div className="mt-4 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-4 flex items-center justify-between border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">
            {format(currentDate, "MMMM yyyy", { locale: id })}
          </h2>
          <div className="flex items-center gap-2">
            <button onClick={goToToday} className="px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors">
              Hari Ini
            </button>
            <div className="flex rounded-md border border-slate-200 overflow-hidden">
              <button onClick={prevMonth} className="p-1.5 hover:bg-slate-50 text-slate-600 transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={nextMonth} className="p-1.5 hover:bg-slate-50 text-slate-600 border-l border-slate-200 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50">
          {weekDays.map(day => (
            <div key={day} className="py-2 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {days.map((day, idx) => {
            const isCurrentMonth = isSameMonth(day, monthStart);
            const isCurrDay = isToday(day);
            
            // Find weeks that span over this day
            const activeWeeks = parsedWeeks.filter(w => 
              day >= w.parsedStart && day <= w.parsedEnd
            );

            return (
              <div 
                key={day.toString()} 
                className={`min-h-[100px] p-1.5 border-b border-r border-slate-100 transition-colors ${!isCurrentMonth ? 'bg-slate-50/50' : 'bg-white hover:bg-slate-50'} ${idx % 7 === 6 ? 'border-r-0' : ''}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-medium ${isCurrDay ? 'bg-[#0f52ba] text-white' : !isCurrentMonth ? 'text-slate-400' : 'text-slate-700'}`}>
                    {format(day, dateFormat)}
                  </span>
                </div>
                
                <div className="space-y-1 mt-1">
                  {activeWeeks.map(week => {
                    const hasProgress = week._count.weeklyProgress > 0;
                    return (
                      <Link key={week.id} href={`/weekly/${week.id}`}>
                        <div className={`p-1 pl-1.5 rounded text-[10px] font-medium leading-tight truncate border ${hasProgress ? 'bg-green-50 border-green-200 text-green-700' : 'bg-[#0f52ba]/5 border-[#0f52ba]/20 text-[#0f52ba] hover:bg-[#0f52ba]/10 text-wrap transition-colors'}`}>
                          <b className="block">Week {week.weekNumber}</b>
                          <span className="font-normal opacity-80">{week.period.name}</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // TIMELINE VIEW (Gantt Chart style like image 1)
  const renderTimelineView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Filter weeks that overlap with this month
    const visibleWeeks = parsedWeeks.filter(w => 
      (w.parsedStart <= monthEnd && w.parsedEnd >= monthStart)
    );

    const groupedVisible = visibleWeeks.reduce<Record<string, typeof visibleWeeks>>(
      (acc, w) => {
        const key = w.period.name;
        if (!acc[key]) acc[key] = [];
        acc[key].push(w);
        return acc;
      },
      {}
    );

    return (
      <div className="mt-4 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
        {/* Toolbar */}
        <div className="p-4 flex items-center justify-between border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">
            {format(currentDate, "MMMM yyyy", { locale: id })}
          </h2>
          <div className="flex items-center gap-2">
            <button onClick={goToToday} className="px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors">
              Hari Ini
            </button>
            <div className="flex rounded-md border border-slate-200 overflow-hidden">
              <button onClick={prevMonth} className="p-1.5 hover:bg-slate-50 text-slate-600 transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={nextMonth} className="p-1.5 hover:bg-slate-50 text-slate-600 border-l border-slate-200 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Board / Timeline Split */}
        <div className="flex flex-1 overflow-hidden min-h-[400px]">
          {/* Left Column (List) */}
          <div className="w-[30%] min-w-[250px] max-w-[350px] border-r border-slate-200 flex flex-col bg-white z-10">
            <div className="h-[45px] border-b border-slate-200 bg-slate-50 flex items-center px-4 font-semibold text-xs text-slate-600 uppercase tracking-widest shrink-0">
              Work Items
            </div>
            <div className="overflow-y-auto flex-1">
              {Object.keys(groupedVisible).length === 0 && (
                <div className="p-4 text-center text-sm text-slate-500">Tidak ada minggu pada bulan ini</div>
              )}
              {Object.entries(groupedVisible).map(([periodName, periodWeeks]) => (
                <div key={periodName}>
                  <div className="px-3 py-2 bg-slate-50/80 border-b border-slate-100 text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <CalendarDays className="w-3 h-3 text-slate-400" /> {periodName}
                  </div>
                  {periodWeeks.map(week => {
                    const hasProgress = week._count.weeklyProgress > 0;
                    return (
                      <div key={week.id} className="h-12 border-b border-slate-100 px-3 flex items-center bg-white group hover:bg-slate-50 transition-colors">
                        <div className="truncate w-full">
                          <Link href={`/weekly/${week.id}`} className="flex items-center gap-2 hover:underline">
                            <span className="shrink-0 w-2 h-2 rounded-full bg-[#0f52ba]"></span>
                            <span className="text-sm font-medium text-slate-900 truncate">Week {week.weekNumber}</span>
                          </Link>
                          <div className="text-[10px] text-slate-500 truncate ml-4 flex gap-2">
                             <span>{format(week.parsedStart,"d MMM")} - {format(week.parsedEnd,"d MMM")}</span>
                             {hasProgress && <span className="text-green-600 font-medium">({week._count.weeklyProgress})</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Right Column (Timeline Grid) */}
          <div className="flex-1 overflow-x-auto overflow-y-auto flex flex-col relative bg-white">
            <div className="absolute top-0 bottom-0 left-0 right-0 min-w-max flex flex-col pointer-events-none">
              {/* Header Days */}
              <div className="h-[45px] border-b border-slate-200 bg-slate-50 flex shrink-0 pointer-events-auto">
                {daysInMonth.map((day, dIdx) => {
                  const isWknd = day.getDay() === 0 || day.getDay() === 6;
                  const isCurrObj = isToday(day);
                  return (
                    <div key={dIdx} className={`w-10 shrink-0 border-r border-slate-200 flex flex-col items-center justify-center ${isWknd ? 'bg-slate-100/50' : ''}`}>
                      <span className={`text-[10px] font-medium uppercase ${isWknd ? 'text-slate-400' : 'text-slate-500'} ${isCurrObj ? 'text-[#0f52ba] font-bold':''}`}>{format(day, 'eee', {locale:id}).substring(0,3)}</span>
                      <span className={`text-xs ${isCurrObj ? 'bg-[#0f52ba] text-white rounded-full w-5 h-5 flex items-center justify-center -mt-0.5' : (isWknd ? 'text-slate-500' : 'text-slate-700 font-medium')}`}>{format(day, 'd')}</span>
                    </div>
                  );
                })}
              </div>
              
              {/* Body Cells / Bars */}
              <div className="flex-1 flex pointer-events-auto">
                {/* Background Grid columns */}
                <div className="absolute inset-x-0 inset-y-0 mt-[45px] flex pointer-events-none z-0">
                  {daysInMonth.map((day, dIdx) => (
                    <div key={dIdx} className={`w-10 shrink-0 border-r border-slate-100 ${day.getDay() === 0 || day.getDay() === 6 ? 'bg-slate-50/50' : ''}`} />
                  ))}
                </div>

                {/* Rows data */}
                <div className="flex-1 flex flex-col z-10 min-w-max">
                  {Object.entries(groupedVisible).map(([periodName, periodWeeks]) => (
                    <div key={periodName} className="flex flex-col">
                      {/* Period Header Spacing */}
                      <div className="h-8 border-b border-slate-100/0"></div> 
                      
                      {periodWeeks.map(week => {
                        const startObj = week.parsedStart;
                        const endObj = week.parsedEnd;
                        
                        // Calculate left offset & width based on 40px per day
                        // Clamp to month start/end
                        const visibleStart = startObj < monthStart ? monthStart : startObj;
                        const visibleEnd = endObj > monthEnd ? monthEnd : endObj;
                        
                        // Diff in days from monthStart
                        const diffSecStart = visibleStart.getTime() - monthStart.getTime();
                        const startDayOffset = Math.floor(diffSecStart / (1000 * 60 * 60 * 24));
                        
                        const diffSecEnd = visibleEnd.getTime() - visibleStart.getTime();
                        let durationDays = Math.ceil(diffSecEnd / (1000 * 60 * 60 * 24)) + 1; // inclusive
                        
                        if (durationDays < 1) durationDays = 1;

                        const leftPos = startDayOffset * 40; // 40px/day (w-10 = 2.5rem = 40px)
                        const width = durationDays * 40;

                        const isExtendingLeft = startObj < monthStart;
                        const isExtendingRight = endObj > monthEnd;

                        return (
                          <div key={week.id} className="h-12 border-b border-slate-100 flex items-center px-0 relative hover:bg-slate-50/50 transition-colors group">
                            <div className="h-full w-full absolute inset-0 group-hover:bg-slate-50/50 -z-10 hidden" />
                            {/* Gantt Bar */}
                            <Link 
                              href={`/weekly/${week.id}`}
                              className="absolute top-2 h-7 rounded bg-[#0f52ba]/10 border border-[#0f52ba]/30 shadow-sm flex items-center px-2 text-[10px] font-semibold text-[#0f52ba] hover:bg-[#0f52ba]/20 hover:border-[#0f52ba] transition-all overflow-hidden whitespace-nowrap"
                              style={{ 
                                left: `${leftPos}px`, 
                                width: `${width}px`,
                                marginLeft: leftPos > 0 ? '2px' : '0px',
                                marginRight: '2px',
                                borderRadius: `${isExtendingLeft ? '0' : '4px'} ${isExtendingRight ? '0' : '4px'} ${isExtendingRight ? '0' : '4px'} ${isExtendingLeft ? '0' : '4px'}`,
                                borderLeftStyle: isExtendingLeft ? 'dashed' : 'solid',
                                borderRightStyle: isExtendingRight ? 'dashed' : 'solid',
                              }}
                              title={`Week ${week.weekNumber}: ${format(startObj, "d MMM")} - ${format(endObj, "d MMM")}`}
                            >
                              <div className="w-full truncate flex items-center gap-1.5">
                                <span className={`w-1.5 h-1.5 rounded-full ${week._count.weeklyProgress > 0 ? 'bg-green-500' : 'bg-[#0f52ba]'}`}></span>
                                Week {week.weekNumber}
                              </div>
                            </Link>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-4">
        <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setView("card")}
            className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              view === "card"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span className="hidden sm:inline">Cards</span>
          </button>
          <button
            onClick={() => setView("list")}
            className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              view === "list"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
            }`}
          >
            <LayoutList className="w-4 h-4" />
            <span className="hidden sm:inline">List</span>
          </button>
          <button
            onClick={() => setView("calendar")}
            className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              view === "calendar"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
            }`}
          >
            <CalendarIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Calendar</span>
          </button>
          <button
            onClick={() => setView("timeline")}
            className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              view === "timeline"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
            }`}
          >
            <Rows className="w-4 h-4" />
            <span className="hidden sm:inline">Timeline</span>
          </button>
        </div>
      </div>

      {view === "card" && renderCardView()}
      {view === "list" && renderListView()}
      {view === "calendar" && renderCalendarView()}
      {view === "timeline" && renderTimelineView()}
    </div>
  );
}
