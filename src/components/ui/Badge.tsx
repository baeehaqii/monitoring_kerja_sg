"use client";
import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info" | "secondary";
  className?: string;
}

const variantClasses = {
  default: "bg-muted text-secondary",
  success: "bg-success-light text-success",
  warning: "bg-warning-light text-warning-dark",
  danger: "bg-error-light text-error",
  info: "bg-primary/10 text-primary",
  secondary: "bg-muted text-secondary",
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold",
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; variant: BadgeProps["variant"] }> = {
    NOT_STARTED: { label: "Belum Mulai", variant: "secondary" },
    ON_PROGRESS: { label: "On Progress", variant: "info" },
    DONE: { label: "Selesai", variant: "success" },
    DELAY: { label: "Terlambat", variant: "danger" },
  };
  const { label, variant } = config[status] ?? { label: status, variant: "default" };
  return <Badge variant={variant}>{label}</Badge>;
}
