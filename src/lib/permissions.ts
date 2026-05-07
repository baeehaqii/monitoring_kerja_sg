// Roles yang bisa manage konten (CRUD strategi, proker, action plan)
const MANAGE_ROLES = ["SUPER_ADMIN", "ADMIN", "GENERAL_MANAGER", "DIREKTUR_BISNIS"] as const;

// Roles yang melihat SEMUA data lintas divisi (tanpa filter divisi)
const GLOBAL_VIEW_ROLES = ["SUPER_ADMIN", "ADMIN"] as const;

// Roles yang punya akses penuh ke user management & settings
const SUPER_ADMIN_ROLES = ["SUPER_ADMIN"] as const;

export type UserRole = "SUPER_ADMIN" | "ADMIN" | "GENERAL_MANAGER" | "DIREKTUR_BISNIS" | "MEMBER";

export interface SessionUser {
  id: string;
  role: string;
  divisionId?: string | null;
}

export function isSuperAdmin(role: string): boolean {
  return (SUPER_ADMIN_ROLES as readonly string[]).includes(role);
}

export function canManage(role: string): boolean {
  return (MANAGE_ROLES as readonly string[]).includes(role);
}

export function isGlobalViewer(role: string): boolean {
  return (GLOBAL_VIEW_ROLES as readonly string[]).includes(role);
}

export function divisionStrategyFilter(user: SessionUser): { divisionId?: string } {
  if (isGlobalViewer(user.role)) return {};
  if (!user.divisionId) return { divisionId: "___no_match___" };
  return { divisionId: user.divisionId };
}

export function nestedDivisionFilter(user: SessionUser) {
  if (isGlobalViewer(user.role)) return {};
  if (!user.divisionId) return { programKerja: { strategy: { divisionId: "___no_match___" } } };
  return {
    programKerja: {
      strategy: { divisionId: user.divisionId },
    },
  };
}
