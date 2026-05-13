"use client";

import * as React from "react";
import {
  DayPicker,
  type DayButtonProps,
} from "react-day-picker";
import { cn } from "@/lib/utils";

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker>) {

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "bg-white p-3 [--cell-size:--spacing(10)] md:[--cell-size:--spacing(11)]",
        className
      )}
      captionLayout={captionLayout}
      formatters={{
        formatMonthDropdown: (date) =>
          date.toLocaleString("id-ID", { month: "long" }),
        ...formatters,
      }}
      classNames={{
        months: "flex gap-4",
        month: "flex flex-col gap-4",
        month_caption:
          "flex items-center justify-center gap-2 px-1 pt-1 text-sm font-semibold text-foreground",
        caption_label: "hidden",
        nav: "hidden",
        button_previous: "hidden",
        button_next: "hidden",
        weekdays: "flex gap-1",
        weekday:
          "text-secondary text-[0.8rem] font-medium w-[var(--cell-size)] text-center",
        week: "flex gap-1 mt-1.5",
        day: cn(
          "relative w-[var(--cell-size)] h-[var(--cell-size)] text-center text-sm p-0",
          "focus-within:relative focus-within:z-20"
        ),
        day_button: cn(
          "inline-flex items-center justify-center w-full h-full rounded-lg",
          "text-sm font-normal transition-colors",
          "hover:bg-primary/10 hover:text-primary cursor-pointer",
          "focus:outline-none focus:ring-2 focus:ring-primary/20"
        ),
        selected: cn(
          "[&_button]:bg-primary [&_button]:text-white",
          "[&_button]:hover:bg-primary-hover [&_button]:hover:text-white",
          "[&_button]:font-semibold"
        ),
        today:
          "[&_button]:bg-primary/10 [&_button]:text-primary [&_button]:font-bold",
        outside: "text-secondary/40 [&_button]:hover:bg-transparent",
        disabled: "text-secondary/30 [&_button]:hover:bg-transparent",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        ...components,
      }}
      {...props}
    />
  );
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}: DayButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center w-full h-full rounded-lg",
        "text-sm font-normal transition-colors",
        "hover:bg-primary/10 hover:text-primary cursor-pointer",
        "focus:outline-none focus:ring-2 focus:ring-primary/20",
        className
      )}
      data-day={day.date.toLocaleDateString()}
      data-selected={modifiers.selected}
      data-today={modifiers.today}
      data-outside={modifiers.outside}
      data-disabled={modifiers.disabled}
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      {...props}
    />
  );
}

export { Calendar, CalendarDayButton };
