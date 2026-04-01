/**
 * Centralized permission logic.
 *
 * Role hierarchy:
 *  - SUPER_ADMIN : dapat melihat & mengelola semua divisi
 *  - ADMIN       : dapat melihat & mengelola divisinya sendiri saja
 *  - MEMBER      : dapat melihat divisinya sendiri saja
 */

export type UserRole = "SUPER_ADMIN" | "ADMIN" | "MEMBER";

export interface SessionUser {
  id: string;
  role: string;
  divisionId?: string | null;
}

/** SUPER_ADMIN bisa akses semua data tanpa filter divisi. */
export function isSuperAdmin(role: string): boolean {
  return role === "SUPER_ADMIN";
}

/** ADMIN atau SUPER_ADMIN — bisa mengelola data (tambah/edit/hapus). */
export function canManage(role: string): boolean {
  return role === "ADMIN" || role === "SUPER_ADMIN";
}

/**
 * Mengembalikan Prisma `where` clause filter divisi berdasarkan role.
 *
 * - SUPER_ADMIN : `{}` (tanpa filter, lihat semua)
 * - ADMIN/MEMBER: `{ divisionId }` (hanya divisi sendiri)
 *
 * Gunakan di query Strategy langsung:
 *   `prisma.strategy.findMany({ where: divisionStrategyFilter(user) })`
 */
export function divisionStrategyFilter(user: SessionUser): { divisionId?: string } {
  if (isSuperAdmin(user.role)) return {};
  if (!user.divisionId) return { divisionId: "___no_match___" }; // user tanpa divisi tidak melihat data
  return { divisionId: user.divisionId };
}

/**
 * Filter divisi untuk query yang melewati relasi ke strategy.
 * Digunakan pada ActionPlan, WeeklyProgress, dll.
 *
 * Contoh:
 *   `prisma.actionPlan.findMany({ where: nestedDivisionFilter(user) })`
 */
export function nestedDivisionFilter(user: SessionUser) {
  if (isSuperAdmin(user.role)) return {};
  if (!user.divisionId) return { programKerja: { strategy: { divisionId: "___no_match___" } } };
  return {
    programKerja: {
      strategy: { divisionId: user.divisionId },
    },
  };
}
