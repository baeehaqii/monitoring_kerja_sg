export const DIVISIONS = [
  "PCD",
  "Penjualan & Pemasaran",
  "Likuiditas",
  "Teknik",
  "Legal & Pengembangan",
  "Keuangan & IT",
] as const;

export const TASK_STATUSES = [
  { value: "NOT_STARTED", label: "Not Started", labelId: "Belum Mulai", color: "bg-slate-100 text-slate-600" },
  { value: "ON_PROGRESS", label: "On Progress", labelId: "Dalam Proses", color: "bg-blue-100 text-blue-700" },
  { value: "DONE", label: "Done", labelId: "Selesai", color: "bg-green-100 text-green-700" },
  { value: "DELAY", label: "Delay", labelId: "Tertunda", color: "bg-red-100 text-red-700" },
] as const;

export const KETERANGAN_OPTIONS = [
  { value: "PARTNER", label: "Partner" },
  { value: "VENDOR", label: "Vendor" },
  { value: "KOLABORATOR", label: "Kolaborator" },
  { value: "LAINNYA", label: "Lainnya" },
] as const;

export const RACI_ACCOUNTABLE = [
  "Direktur Utama",
  "Dir. Penjualan & Pemasaran",
  "Dir. Likuiditas",
  "Dir. Teknik",
  "Dir. Legal & Pengembangan",
  "Dir. Keuangan & IT",
] as const;

export const RACI_RESPONSIBLE = [
  "PCD",
  "Manajer Penjualan & Pemasaran",
  "Sales",
  "Manajer Likuiditas",
  "Staf Likuiditas",
  "Manajer Teknik",
  "QA",
  "Supervisor Legal",
  "Staf Legal",
  "Manajer Keuangan",
  "Admin Keuangan",
  "Admin Marketing",
  "Admin Likuiditas",
  "Admin Pembangunan",
  "Admin Pajak",
] as const;

export const RACI_CONSULTED = [
  "Direktur Utama",
  "Dir. Bisnis",
  "Divisi Penjualan & Pemasaran",
  "Divisi Likuiditas",
  "Divisi Teknik",
  "Divisi Legal",
  "Divisi Keuangan",
] as const;

export const RACI_INFORMED = [
  "Direktur Utama",
  "PCD",
  "Divisi Likuiditas",
  "Dir. Bisnis",
  "All",
] as const;

export const STATUS_COLORS: Record<string, string> = {
  NOT_STARTED: "bg-slate-100 text-slate-600 border-slate-200",
  ON_PROGRESS: "bg-blue-100 text-blue-700 border-blue-200",
  DONE: "bg-green-100 text-green-700 border-green-200",
  DELAY: "bg-red-100 text-red-700 border-red-200",
};

export const STATUS_LABELS: Record<string, string> = {
  NOT_STARTED: "Not Started",
  ON_PROGRESS: "On Progress",
  DONE: "Done",
  DELAY: "Delay",
};
