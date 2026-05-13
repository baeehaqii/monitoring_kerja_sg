import type { MenuPermission } from "@/types/next-auth";

// System roles yang selalu punya akses penuh (tidak perlu customRole)
const SUPER_ADMIN_ROLES = ["SUPER_ADMIN"] as const;
const FULL_ACCESS_ROLES = ["SUPER_ADMIN", "ADMIN"] as const;

export type UserRole = "SUPER_ADMIN" | "ADMIN" | "GENERAL_MANAGER" | "DIREKTUR_BISNIS" | "MEMBER";

export interface SessionUser {
  id: string;
  role: string;
  divisionId?: string | null;
  permissions?: MenuPermission[];
}

export function isSuperAdmin(role: string): boolean {
  return (SUPER_ADMIN_ROLES as readonly string[]).includes(role);
}

export function isFullAccess(role: string): boolean {
  return (FULL_ACCESS_ROLES as readonly string[]).includes(role);
}

/** Cek apakah user boleh melakukan action tertentu di sebuah menu.
 *  SUPER_ADMIN & ADMIN selalu lolos.
 *  User lain dicek dari daftar permissions customRole mereka.
 */
export function hasPermission(
  user: SessionUser,
  menu: string,
  action: "canView" | "canCreate" | "canEdit" | "canDelete"
): boolean {
  if (isFullAccess(user.role)) return true;
  if (!user.permissions?.length) return false;
  const perm = user.permissions.find((p) => p.menu === menu);
  return perm?.[action] ?? false;
}

/** Shorthand — bisa melakukan create/edit/delete di menu manapun yang diizinkan */
export function canManage(role: string, permissions?: MenuPermission[]): boolean {
  if (isFullAccess(role)) return true;
  if (!permissions?.length) return false;
  return permissions.some((p) => p.canCreate || p.canEdit || p.canDelete);
}

/** Shorthand khusus per menu */
export function canManageMenu(
  user: SessionUser,
  menu: string
): boolean {
  if (isFullAccess(user.role)) return true;
  const perm = user.permissions?.find((p) => p.menu === menu);
  return !!(perm?.canCreate || perm?.canEdit || perm?.canDelete);
}

export function isGlobalViewer(role: string): boolean {
  return isFullAccess(role);
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
