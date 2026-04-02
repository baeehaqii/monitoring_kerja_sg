export type UserRole = "SUPER_ADMIN" | "ADMIN" | "MEMBER";

export interface SessionUser {
  id: string;
  role: string;
  divisionId?: string | null;
}

export function isSuperAdmin(role: string): boolean {
  return role === "SUPER_ADMIN";
}

export function canManage(role: string): boolean {
  return role === "ADMIN" || role === "SUPER_ADMIN";
}

export function divisionStrategyFilter(user: SessionUser): { divisionId?: string } {
  if (isSuperAdmin(user.role)) return {};
  if (!user.divisionId) return { divisionId: "___no_match___" };
  return { divisionId: user.divisionId };
}

export function nestedDivisionFilter(user: SessionUser) {
  if (isSuperAdmin(user.role)) return {};
  if (!user.divisionId) return { programKerja: { strategy: { divisionId: "___no_match___" } } };
  return {
    programKerja: {
      strategy: { divisionId: user.divisionId },
    },
  };
}
