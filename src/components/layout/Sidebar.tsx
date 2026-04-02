"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ClipboardList,
  CalendarDays,
  Settings,
  LogOut,
  Bell,
  Users,
  MessageCircleQuestion,
  X,
} from "lucide-react";
import { signOut } from "next-auth/react";

const navItems = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/proker", icon: ClipboardList, label: "Program Kerja" },
  { href: "/weekly", icon: CalendarDays, label: "Weekly Progress" },
  { href: "/reminders", icon: Bell, label: "Pengingat SLA" },
];

const adminItems = [
  { href: "/settings/users", icon: Users, label: "Pengguna" },
  { href: "/settings", icon: Settings, label: "Pengaturan" },
];

interface SidebarProps {
  userRole?: string;
  userName?: string;
  userDivision?: string | null;
  onClose?: () => void;
  isMobile?: boolean;
}

export function Sidebar({
  userRole,
  userName,
  userDivision,
  onClose,
  isMobile,
}: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const isSuperAdmin = userRole === "SUPER_ADMIN";

  return (
    <aside className="flex flex-col w-[280px] shrink-0 h-screen bg-white border-r border-border overflow-hidden">
      <div className="flex items-center justify-between border-b border-border h-[72px] px-5 gap-3">
        <div className="flex items-center gap-3">
          <img src="/logo-siproper.png" alt="Logo Sapphire Grup" className="h-9 w-auto object-contain" />
          <div className="min-w-0">
            <p className="font-semibold text-base text-foreground leading-tight">
              Task Monitoring App
            </p>
            <p className="text-[11px] text-secondary leading-tight">
              by Siproper Digital System
            </p>
          </div>
        </div>
        {isMobile && onClose && (
          <button
            onClick={onClose}
            aria-label="Tutup sidebar"
            className="size-9 flex shrink-0 bg-white rounded-xl items-center justify-center ring-1 ring-border hover:ring-primary transition-all duration-200 cursor-pointer"
          >
            <X className="size-5 text-secondary" />
          </button>
        )}
      </div>

      <div className="flex flex-col p-4 pb-28 gap-5 overflow-y-auto flex-1">
        <div className="flex flex-col gap-3">
          <h3 className="font-medium text-xs text-secondary px-1 uppercase tracking-wide">
            Menu Utama
          </h3>
          <div className="flex flex-col gap-0.5">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center rounded-xl px-4 py-3 gap-3 transition-all duration-200",
                  isActive(item.href)
                    ? "bg-muted"
                    : "bg-white hover:bg-muted"
                )}
              >
                <item.icon
                  className={cn(
                    "w-5 h-5 flex-shrink-0 transition-colors duration-200",
                    isActive(item.href) ? "text-foreground" : "text-secondary"
                  )}
                />
                <span
                  className={cn(
                    "text-sm transition-colors duration-200",
                    isActive(item.href)
                      ? "font-semibold text-foreground"
                      : "font-medium text-secondary"
                  )}
                >
                  {item.label}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {isSuperAdmin && (
          <div className="flex flex-col gap-3">
            <h3 className="font-medium text-xs text-secondary px-1 uppercase tracking-wide">
              Admin
            </h3>
            <div className="flex flex-col gap-0.5">
              {adminItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center rounded-xl px-4 py-3 gap-3 transition-all duration-200",
                    isActive(item.href)
                      ? "bg-muted"
                      : "bg-white hover:bg-muted"
                  )}
                >
                  <item.icon
                    className={cn(
                      "w-5 h-5 flex-shrink-0 transition-colors duration-200",
                      isActive(item.href) ? "text-foreground" : "text-secondary"
                    )}
                  />
                  <span
                    className={cn(
                      "text-sm transition-colors duration-200",
                      isActive(item.href)
                        ? "font-semibold text-foreground"
                        : "font-medium text-secondary"
                    )}
                  >
                    {item.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 w-[280px] border-t border-border bg-white">
        <div className="px-5 py-3 border-b border-border">
          <p className="text-sm font-semibold text-foreground truncate">
            {userName ?? "User"}
          </p>
          <p className="text-xs text-secondary truncate">
            {userDivision ?? "—"}
          </p>
        </div>
        <div className="flex items-center justify-between px-5 py-3 gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="size-8 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <MessageCircleQuestion className="size-4 text-red-600" />
            </div>
            <a href="https://help.siproper.com/submit" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-secondary truncate">
              Butuh bantuan?
            </a>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="size-8 flex items-center justify-center rounded-xl text-secondary hover:text-error hover:bg-error-light transition-all duration-200 flex-shrink-0"
            title="Keluar"
          >
            <LogOut className="size-4" />
          </button>
        </div>
        <div className="px-5 py-2.5 border-t border-border bg-slate-50/50 flex justify-center">
          <p className="text-[10px] font-medium text-slate-400">
            Developed by IT Sapphire Grup 2026
          </p>
        </div>
      </div>
    </aside>
  );
}
