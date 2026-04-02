import { format, parseISO } from "date-fns";
import { id as idLocale } from "date-fns/locale";

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "-";
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "dd MMM yyyy", { locale: idLocale });
}

export function formatDateShort(date: Date | string | null | undefined): string {
  if (!date) return "-";
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "dd/MM/yyyy");
}

export function formatMonthYear(date: Date | string | null | undefined): string {
  if (!date) return "-";
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "MMMM yyyy", { locale: idLocale });
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    NOT_STARTED: "bg-slate-100 text-slate-600",
    ON_PROGRESS: "bg-blue-100 text-blue-700",
    DONE: "bg-green-100 text-green-700",
    DELAY: "bg-red-100 text-red-700",
  };
  return colors[status] ?? "bg-slate-100 text-slate-600";
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    NOT_STARTED: "Not Started",
    ON_PROGRESS: "On Progress",
    DONE: "Done",
    DELAY: "Delay",
  };
  return labels[status] ?? status;
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");
}

export function generateTargetDates(): { value: string; label: string }[] {
  const dates = [];
  for (let year = 2026; year <= 2028; year++) {
    for (let month = 1; month <= 12; month++) {
      const d = new Date(year, month, 0);
      dates.push({
        value: d.toISOString(),
        label: format(d, "dd MMMM yyyy", { locale: idLocale }),
      });
    }
  }
  return dates;
}
