"use client";
import { Bell } from "lucide-react";
import Link from "next/link";

interface HeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function Header({ title, subtitle, action }: HeaderProps) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">{title}</h1>
        {subtitle && <p className="text-sm text-secondary mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        {action}
        <Link
          href="/reminders"
          className="relative w-10 h-10 flex items-center justify-center rounded-xl text-secondary hover:text-foreground ring-1 ring-border hover:ring-primary transition-all duration-200"
        >
          <Bell className="w-5 h-5" />
        </Link>
      </div>
    </div>
  );
}
