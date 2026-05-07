/**
 * Seeder: Monitoring Program Kerja GM Marketing Graha
 * User  : Goffar (abdulgoffar@siproper.com)
 * Source: Monitoring Program Kerja_GM Marketing Graha.xlsx
 *         Sheets  → AllProject, Graha 1, Graha 2, Graha 3, Graha 4
 * Period: April 2026
 *
 * Struktur hierarki:
 *   Strategy (Strategi) → ProgramKerja (Taktik) → ActionPlan (Task List) + Status
 *
 * Pendekatan:
 *   - AllProject  : 4 Strategi utama (GM Marketing level, tanpa projectId)
 *   - Graha 1–4  : ActionPlan detail per-cluster ditambahkan ke ProgramKerja
 *                  yang sama dengan offset nomor (setelah AP dari AllProject)
 */

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter } as any);

type TaskStatus = "DONE" | "ON_PROGRESS" | "NOT_STARTED" | "DELAY";

function mapStatus(raw: string | null | undefined): TaskStatus {
  if (!raw) return "NOT_STARTED";
  const s = raw.trim().toLowerCase();
  if (s === "done") return "DONE";
  if (s === "on progress") return "ON_PROGRESS";
  if (s === "delay") return "DELAY";
  if (s === "cancel") return "NOT_STARTED";
  return "NOT_STARTED";
}

// ── Data Definition ────────────────────────────────────────────────────────

type AP = { number: number; name: string; status: TaskStatus };
type PK = { number: number; name: string; actionPlans: AP[] };
type Strat = { number: number; name: string; programKerja: PK[] };

// ── AllProject: 4 Strategi Utama (GM Marketing Level) ─────────────────────

const STRATEGIES_ALL_PROJECT: Strat[] = [
  {
    number: 1,
    name: "Kuasai ruang publik dengan Marketing Tools Sapphire untuk mendongkrak AWARENESS (VISUAL)",
    programKerja: [
      {
        number: 1,
        name: "Revisual 18 Baliho 4x6 Existing (Pribadi)",
        actionPlans: [
          { number: 1,  name: "Sapphire Townhouse Bumiayu - Jl. Lingkar Bumiayu (Lampu Baliho)",    status: "ON_PROGRESS" },
          { number: 2,  name: "Samara Village Bumiayu - Depan Proyek",                               status: "ON_PROGRESS" },
          { number: 3,  name: "Sapphire Madani - Depan Proyek",                                      status: "ON_PROGRESS" },
          { number: 4,  name: "Sapphire Riverside - Kedungmalang",                                   status: "ON_PROGRESS" },
          { number: 5,  name: "Sapphire Riverside - UHB",                                            status: "ON_PROGRESS" },
          { number: 6,  name: "Sapphire Madani - Mitra 10",                                          status: "ON_PROGRESS" },
          { number: 7,  name: "Sapphire Madani - Karanggude",                                        status: "ON_PROGRESS" },
          { number: 8,  name: "Sapphire Riverside - Tugu Adipura Berkoh",                            status: "ON_PROGRESS" },
          { number: 9,  name: "Sapphire Residence Sumbang - Kedungmalang",                           status: "ON_PROGRESS" },
          { number: 10, name: "Sapphire Residence Sumbang - Depan Proyek",                           status: "ON_PROGRESS" },
          { number: 11, name: "Sapphire Residence Sumbang - Karangcegak",                            status: "ON_PROGRESS" },
          { number: 12, name: "Sapphire Residence Sumbang - UHB",                                    status: "ON_PROGRESS" },
          { number: 13, name: "Sapphire Residence Sumbang - Tugu Adipura Berkoh",                    status: "ON_PROGRESS" },
          { number: 14, name: "Sapphire Townhouse Purbalingga - Bobotsari",                          status: "ON_PROGRESS" },
          { number: 15, name: "Sapphire Townhouse Purbalingga - Soemarmo Square",                    status: "ON_PROGRESS" },
          { number: 16, name: "Sapphire Serenity - Depan Proyek",                                    status: "ON_PROGRESS" },
          { number: 17, name: "Sapphire Serenity - Lampu Merah Pegalongan",                          status: "ON_PROGRESS" },
          { number: 18, name: "Sapphire Serenity - Mitra 10",                                        status: "ON_PROGRESS" },
        ],
      },
      {
        number: 2,
        name: "Revisual 9 Baliho SELAIN 4x6 Existing (Pribadi)",
        actionPlans: [
          { number: 1, name: "Sapphire Townhouse Bumiayu - BRI Kalierang",                           status: "ON_PROGRESS" },
          { number: 2, name: "Samara Village Bumiayu - Pertigaan Jl. Lapangan Asri",                 status: "ON_PROGRESS" },
          { number: 3, name: "Sapphire Madani - Sapphire KS Tubun",                                  status: "ON_PROGRESS" },
          { number: 4, name: "Sapphire Madani - Utara Amira Classic (Jl. KS Tubun)",                 status: "ON_PROGRESS" },
          { number: 5, name: "Sapphire Madani - Sapphire Village",                                   status: "ON_PROGRESS" },
          { number: 6, name: "Sapphire Townhouse Purbalingga - Depan Proyek",                        status: "ON_PROGRESS" },
          { number: 7, name: "Samara Pegalongan - Gunung Tugel (TPA)",                               status: "DONE"        },
          { number: 8, name: "Samara Asri Wiradadi - SD Wiradadi",                                   status: "DONE"        },
          { number: 9, name: "Samara Asri Wiradadi - Jl. Protokol Wiradadi",                         status: "DONE"        },
        ],
      },
      {
        number: 3,
        name: "Sewa Baliho Baru 9 Titik",
        actionPlans: [
          { number: 1, name: "Sapphire Townhouse Bumiayu - Deket Polsek Bumiayu",                    status: "ON_PROGRESS" },
          { number: 2, name: "Sapphire Riverside - Pertigaan Sokaraja-Purbalingga",                  status: "ON_PROGRESS" },
          { number: 3, name: "Sapphire Madani - Perempatan Tanjung (sebelah Pos Polisi)",            status: "ON_PROGRESS" },
          { number: 4, name: "Sapphire Madani - Radius Pasar Manis",                                 status: "ON_PROGRESS" },
          { number: 5, name: "Sapphire Riverside - Tugu Sakanti Dahana Patra (Tugu Lilin Gumilir - Cilacap)", status: "ON_PROGRESS" },
          { number: 6, name: "Sapphire Townhouse Purbalingga - Eka Surya Purbalingga",               status: "ON_PROGRESS" },
          { number: 7, name: "Sapphire Townhouse Purbalingga - Mayjen Sungkono",                     status: "ON_PROGRESS" },
          { number: 8, name: "Sapphire Residence Sumbang - Depan Pasar Banyumas",                    status: "ON_PROGRESS" },
          { number: 9, name: "Sapphire Serenity - SMA 4 OVis",                                       status: "ON_PROGRESS" },
        ],
      },
      {
        number: 4,
        name: "Pemasangan Zenith CGR di 6 Proyek Existing (Konsep Mahasiswa, Konsumen Existing, Kawasan)",
        actionPlans: [
          { number: 1, name: "12 Titik Sapphire Madani (formasi 4:4:4) - 4 titik CGR, 1 titik mahasiswa, 3 titik value", status: "ON_PROGRESS" },
          { number: 2, name: "4 Titik Sapphire Riverside (formasi 3:1:0) - 1 titik CGR, 1 titik mahasiswa, 2 titik value", status: "ON_PROGRESS" },
          { number: 3, name: "3 Titik Sapphire Townhouse Bumiayu (Formasi 1:1:1) - 1 titik CGR, 1 mahasiswa, 1 value",    status: "ON_PROGRESS" },
          { number: 4, name: "8 Titik Sapphire Residence Sumbang (Formasi 2:3:3) - 3 titik CGR, 2 mahasiswa, 2 value",   status: "ON_PROGRESS" },
          { number: 5, name: "5 Titik Sapphire Townhouse Purbalingga (Formasi 1:2:2) - 3 titik CGR, 1 mahasiswa, 1 value", status: "ON_PROGRESS" },
          { number: 6, name: "3 Titik Baru Samara Village Bumiayu (Formasi 1:1:1) - 2 titik CGR, 1 titik value",         status: "ON_PROGRESS" },
          { number: 7, name: "Revisual Zenith Taman Langit",                                                               status: "ON_PROGRESS" },
          { number: 8, name: "Pemasangan Zenith Ajibarang depan (Zamrud) 2; belakang (Ruby) 1 - 3 titik CGR",             status: "ON_PROGRESS" },
        ],
      },
      {
        number: 5,
        name: "Pemasangan Zenith CGR di 3 Proyek Lama (Konsep Mahasiswa, Konsumen Existing, Kawasan)",
        actionPlans: [
          { number: 1, name: "Pemasangan 4 Titik Baru di Sapphire Residence Karangwangkal (2:2) - 2 titik CGR", status: "ON_PROGRESS" },
          { number: 2, name: "Pemasangan 4 Titik Baru di Sapphire KS Tubun (2:2) - 2 titik CGR",                status: "ON_PROGRESS" },
          { number: 3, name: "Pemasangan 4 Titik Baru di Sapphire Estate Sumampir (2:2) - 2 titik CGR",         status: "ON_PROGRESS" },
        ],
      },
      {
        number: 6,
        name: "Pemindahan 11 Mini Baliho di Bale Hinggil",
        actionPlans: [
          { number: 1, name: "6 mini baliho di Ajibarang blok Zamrud", status: "ON_PROGRESS" },
          { number: 2, name: "5 mini baliho di Ajibarang blok Ruby",   status: "ON_PROGRESS" },
        ],
      },
    ],
  },

  {
    number: 2,
    name: "Perkuat Integrated Full Funnel Marketing untuk mendongkrak INTERAKSI sampai KONVERSI (DIGITAL)",
    programKerja: [
      {
        number: 1,
        name: "Perkuat Branding dengan Strategi Organik (Konten Sosmed)",
        actionPlans: [
          { number: 1, name: "16 Konten Soft Selling dan Hard Selling reguler", status: "ON_PROGRESS" },
        ],
      },
      {
        number: 2,
        name: "Dongkrak Interaksi dan Konversi menggunakan Strategi Ads",
        actionPlans: [
          { number: 1, name: "Dioptimasi/REM Budget (Sapphire TH Bumiayu, Sapphire Serenity Karangklesem, Sapphire TH Purbalingga, Sapphire Residence Sumbang)", status: "ON_PROGRESS" },
          { number: 2, name: "Dioptimasi & Monitoring (Samara Pegalongan, Sapphire Riverside)",                                                                  status: "ON_PROGRESS" },
          { number: 3, name: "Murah WAJIB DIGAS (Samara Wiradadi, Madani Purwokerto, Event, Samara Village)",                                                    status: "ON_PROGRESS" },
          { number: 4, name: "Jalan Campaign Retargeting",                                                                                                       status: "ON_PROGRESS" },
        ],
      },
      {
        number: 3,
        name: "Masifkan Kolaborasi dengan Akun Medsos Pihak Ketiga",
        actionPlans: [
          { number: 1, name: "Paid Promote Media Lokal & KOL (Info Purwokerto, Info Bumiayu, Purwokerto City, List KOL)", status: "ON_PROGRESS" },
          { number: 2, name: "Collab Post (Institusi DLH, Brand: Tala, Dr Yuskin, Pintu Berdikari)",                     status: "ON_PROGRESS" },
        ],
      },
      {
        number: 4,
        name: "Kelola Customer menggunakan Strategi CRM",
        actionPlans: [
          { number: 1, name: "Kelola data customer dengan membuat Channel (CS Mol Cold-Warm-Hot, WA Channel, IG Channel)", status: "ON_PROGRESS" },
          { number: 2, name: "Survei Kepuasan Konsumen Booking setiap bulan",                                              status: "ON_PROGRESS" },
          { number: 3, name: "Survei Kepuasan Konsumen BAST setiap bulan",                                                 status: "ON_PROGRESS" },
          { number: 4, name: "Survei Kepuasan Konsumen Akad setiap bulan",                                                 status: "ON_PROGRESS" },
          { number: 5, name: "Program Birthday / Touch Point untuk konsumen VIP existing",                                 status: "ON_PROGRESS" },
          { number: 6, name: "Email Marketing",                                                                            status: "NOT_STARTED" },
        ],
      },
    ],
  },

  {
    number: 3,
    name: "Perluasan MoU dengan Pihak Ketiga dalam mendongkrak Trust Konsumen",
    programKerja: [
      { number: 1,  name: "MoU Branding - KAI Purwokerto",    actionPlans: [{ number: 1, name: "Promosi Visual di Area Indoor dan Outdoor Stasiun KAI Purwokerto",    status: "ON_PROGRESS" }] },
      { number: 2,  name: "MoU Branding - KAI Kroya",         actionPlans: [{ number: 1, name: "Promosi Visual di Area Indoor dan Outdoor Stasiun KAI Kroya",         status: "ON_PROGRESS" }] },
      { number: 3,  name: "MoU Branding - KAI Bumiayu",       actionPlans: [{ number: 1, name: "Promosi Visual di Area Indoor dan Outdoor Stasiun KAI Bumiayu",       status: "ON_PROGRESS" }] },
      { number: 4,  name: "MoU Yu Skin",                      actionPlans: [{ number: 1, name: "Kerjasama pemasaran dengan Yu Skin",                                  status: "ON_PROGRESS" }] },
      { number: 5,  name: "MoU Taman Langit",                 actionPlans: [{ number: 1, name: "Pemasangan Totem/SignAge Digital di area lobby/resto dan promosi di TV Promosional Channel Taman Langit", status: "ON_PROGRESS" }] },
      { number: 6,  name: "MoU Bioskop CGV",                  actionPlans: [{ number: 1, name: "Pasang Iklan di Bioskop CGV",                                         status: "ON_PROGRESS" }] },
      { number: 7,  name: "MoU Rita Mall",                    actionPlans: [{ number: 1, name: "Promosi Visual di Area Indoor dan Outdoor Rita Mall",                  status: "ON_PROGRESS" }] },
      { number: 8,  name: "MoU Hotel Luminor",                actionPlans: [{ number: 1, name: "Pemasangan Totem/SignAge Digital di lobby/resto dan In-Room Promosional Channel Hotel Luminor", status: "ON_PROGRESS" }] },
      { number: 9,  name: "MoU Hotel Java Heritage",          actionPlans: [{ number: 1, name: "Pemasangan Totem/SignAge Digital di lobby/resto dan In-Room Promosional Channel Java Heritage", status: "ON_PROGRESS" }] },
      { number: 10, name: "MoU Hotel Dominic (Hotel DM)",     actionPlans: [{ number: 1, name: "Pemasangan Totem/SignAge Digital di lobby/resto dan In-Room Promosional Channel Hotel DM",      status: "ON_PROGRESS" }] },
      { number: 11, name: "MoU Hotel Toyo",                   actionPlans: [{ number: 1, name: "Pemasangan Totem/SignAge Digital di lobby/resto dan In-Room Promosional Channel Hotel Toyo",    status: "ON_PROGRESS" }] },
      { number: 12, name: "MoU Hotel Meotel",                 actionPlans: [{ number: 1, name: "Pemasangan Totem/SignAge Digital di lobby/resto dan In-Room Promosional Channel Hotel Meotel",  status: "ON_PROGRESS" }] },
      { number: 13, name: "MoU Hotel COR",                    actionPlans: [{ number: 1, name: "Pemasangan Totem/SignAge Digital di lobby/resto dan In-Room Promosional Channel Hotel COR",     status: "ON_PROGRESS" }] },
      { number: 14, name: "MoU Braling Grand Hotel",          actionPlans: [{ number: 1, name: "Pemasangan Totem/SignAge Digital di lobby/resto dan In-Room Promosional Channel Braling Grand", status: "ON_PROGRESS" }] },
      { number: 15, name: "MoU Bank BTN",                     actionPlans: [{ number: 1, name: "Pemasangan Totem/SignAge Digital & X-Banner di cabang Bank BTN",      status: "ON_PROGRESS" }] },
      { number: 16, name: "MoU Bank Mandiri",                 actionPlans: [{ number: 1, name: "Pemasangan Totem/SignAge Digital & X-Banner di cabang Bank Mandiri",  status: "ON_PROGRESS" }] },
      { number: 17, name: "MoU Bank BSI",                     actionPlans: [{ number: 1, name: "Pemasangan Totem/SignAge Digital & X-Banner di cabang Bank BSI",      status: "ON_PROGRESS" }] },
      { number: 18, name: "MoU Bank BRI",                     actionPlans: [{ number: 1, name: "Pemasangan Totem/SignAge Digital & X-Banner di cabang Bank BRI",      status: "ON_PROGRESS" }] },
      { number: 19, name: "MoU Bank BPD",                     actionPlans: [{ number: 1, name: "Pemasangan Totem/SignAge Digital & X-Banner di cabang Bank BPD",      status: "ON_PROGRESS" }] },
      { number: 20, name: "MoU RSIA Bunda Arif",              actionPlans: [{ number: 1, name: "Program KPR Promo, Pemasangan Totem dan aktivitas pemasaran di RSIA Bunda Arif", status: "DONE" }] },
      { number: 21, name: "MoU Gym Nest",                     actionPlans: [{ number: 1, name: "Pemasangan Totem, Partnership dan Referral bersama Gym Nest",         status: "NOT_STARTED" }] },
    ],
  },

  {
    number: 4,
    name: "Penguatan Branding Sapphire Graha dengan Kolaborasi Event Marketing",
    programKerja: [
      {
        number: 1,
        name: "Peringatan Hari Besar",
        actionPlans: [
          { number: 1, name: "Hari Konsumen, Hari Kartini, Hari Bumi", status: "DONE" },
        ],
      },
      {
        number: 2,
        name: "Event Offline dengan berfokus pada output leads dan referral",
        actionPlans: [
          { number: 1, name: "Open House",                        status: "ON_PROGRESS" },
          { number: 2, name: "Fun Run Townhouse Purbalingga",     status: "ON_PROGRESS" },
        ],
      },
      {
        number: 3,
        name: "Event CGR",
        actionPlans: [
          { number: 1, name: "Seminar / Gathering di lokasi proyek dengan gandeng Perbankan, Yu Skin & TaLa", status: "ON_PROGRESS" },
          { number: 2, name: "Video testimoni konsumen terpilih dengan reward bingkisan",                     status: "NOT_STARTED" },
        ],
      },
      {
        number: 4,
        name: "Event CFD",
        actionPlans: [
          { number: 1, name: "Branding di alun-alun dengan mobil branding BYD", status: "ON_PROGRESS" },
        ],
      },
      {
        number: 5,
        name: "Event Kolaborasi dengan All Mitra Perbankan",
        actionPlans: [
          { number: 1, name: "Kunjungan dan sosialisasi dengan gandeng mitra perbankan", status: "ON_PROGRESS" },
        ],
      },
      {
        number: 6,
        name: "Event Kolaborasi dengan Komunitas",
        actionPlans: [
          { number: 1, name: "Komunitas lari",     status: "ON_PROGRESS" },
          { number: 2, name: "Komunitas otomotif", status: "ON_PROGRESS" },
          { number: 3, name: "Komunitas sepeda",   status: "ON_PROGRESS" },
        ],
      },
    ],
  },
];

// ── Graha 1: Detail AP per-cluster (GRAHA I) ──────────────────────────────
// Ditambahkan ke ProgramKerja yang sama dgn offset nomor setelah AllProject
// Offset: PK1 → +18, PK2 → +9, PK3 → +9
const GRAHA1_EXTRA: { pkNumber: number; aps: AP[] }[] = [
  {
    pkNumber: 1,
    aps: [
      { number: 19, name: "[GRAHA I] Samara Village Bumiayu - Jln Lingkar Bumiayu (Depan Proyek)",     status: "ON_PROGRESS" },
      { number: 20, name: "[GRAHA I] Samara Village Bumiayu - Desain Visual",                          status: "DONE"        },
      { number: 21, name: "[GRAHA I] Samara Village Bumiayu - Cetak Visual",                           status: "ON_PROGRESS" },
      { number: 22, name: "[GRAHA I] Samara Village Bumiayu - Pemasangan",                             status: "ON_PROGRESS" },
      { number: 23, name: "[GRAHA I] Sapphire Townhouse Bumiayu - Jln Lingkar Bumiayu (Depan Proyek)", status: "ON_PROGRESS" },
      { number: 24, name: "[GRAHA I] Sapphire Townhouse Bumiayu - Desain Visual",                      status: "ON_PROGRESS" },
      { number: 25, name: "[GRAHA I] Sapphire Townhouse Bumiayu - Cetak Visual",                       status: "ON_PROGRESS" },
      { number: 26, name: "[GRAHA I] Sapphire Townhouse Bumiayu - Pemasangan",                         status: "ON_PROGRESS" },
    ],
  },
  {
    pkNumber: 2,
    aps: [
      { number: 10, name: "[GRAHA I] Mini Billboard STH Bumiayu 1x2, 2 muka - Pertigaan Toko Sidodadi", status: "ON_PROGRESS" },
      { number: 11, name: "[GRAHA I] Mini Billboard STH Bumiayu - Desain Visual",                        status: "ON_PROGRESS" },
      { number: 12, name: "[GRAHA I] Mini Billboard STH Bumiayu - Cetak Visual",                         status: "ON_PROGRESS" },
      { number: 13, name: "[GRAHA I] Mini Billboard STH Bumiayu - Pemasangan",                           status: "ON_PROGRESS" },
    ],
  },
  {
    pkNumber: 3,
    aps: [
      { number: 10, name: "[GRAHA I] Sapphire TH Bumiayu - Pasar Bumiayu",   status: "ON_PROGRESS" },
      { number: 11, name: "[GRAHA I] Sapphire TH Bumiayu - Desain Visual",   status: "ON_PROGRESS" },
      { number: 12, name: "[GRAHA I] Sapphire TH Bumiayu - Cetak Visual",    status: "ON_PROGRESS" },
      { number: 13, name: "[GRAHA I] Sapphire TH Bumiayu - Pemasangan",      status: "ON_PROGRESS" },
    ],
  },
  {
    pkNumber: 4,
    aps: [
      { number: 9,  name: "[GRAHA I] 3 Titik STH Bumiayu (0:3:0) Revisual - Desain Visual",           status: "ON_PROGRESS" },
      { number: 10, name: "[GRAHA I] 3 Titik STH Bumiayu (0:3:0) Revisual - Cetak Visual",            status: "ON_PROGRESS" },
      { number: 11, name: "[GRAHA I] 3 Titik STH Bumiayu (0:3:0) Revisual - Pemasangan",              status: "ON_PROGRESS" },
      { number: 12, name: "[GRAHA I] 3 Titik Baru Samara Village (0:1:2) - Desain Visual",            status: "ON_PROGRESS" },
      { number: 13, name: "[GRAHA I] 3 Titik Baru Samara Village (0:1:2) - Cetak Visual",             status: "ON_PROGRESS" },
      { number: 14, name: "[GRAHA I] 3 Titik Baru Samara Village (0:1:2) - Produksi Rangka",          status: "ON_PROGRESS" },
      { number: 15, name: "[GRAHA I] 3 Titik Baru Samara Village (0:1:2) - Pemasangan",               status: "ON_PROGRESS" },
      { number: 16, name: "[GRAHA I] Zenith Ajibarang (Zamrud+Ruby) - Produksi Rangka",               status: "ON_PROGRESS" },
      { number: 17, name: "[GRAHA I] Zenith Ajibarang (Zamrud+Ruby) - Cetak Visual",                  status: "ON_PROGRESS" },
      { number: 18, name: "[GRAHA I] Zenith Ajibarang (Zamrud+Ruby) - Desain Visual",                 status: "ON_PROGRESS" },
      { number: 19, name: "[GRAHA I] Zenith Ajibarang (Zamrud+Ruby) - Pemasangan",                    status: "ON_PROGRESS" },
    ],
  },
  {
    pkNumber: 6,
    aps: [
      { number: 3, name: "[GRAHA I] Relokasi & Pemasangan 11 Titik ke Ajibarang - Cetak Visual",  status: "ON_PROGRESS" },
      { number: 4, name: "[GRAHA I] Relokasi & Pemasangan 11 Titik ke Ajibarang - Desain Visual", status: "ON_PROGRESS" },
      { number: 5, name: "[GRAHA I] Relokasi & Pemasangan 11 Titik ke Ajibarang - Pemasangan",    status: "ON_PROGRESS" },
    ],
  },
];

// ── Graha 2: Detail AP per-cluster (GRAHA II) ─────────────────────────────
const GRAHA2_EXTRA: { pkNumber: number; aps: AP[] }[] = [
  {
    pkNumber: 1,
    aps: [
      { number: 27, name: "[GRAHA II] Sapphire Madani - Pasar Notog (Replace rencana pasang di Cilacap)",  status: "ON_PROGRESS" },
      { number: 28, name: "[GRAHA II] Sapphire Madani - Desain Visual",                                    status: "ON_PROGRESS" },
      { number: 29, name: "[GRAHA II] Sapphire Madani - Cetak Visual",                                     status: "ON_PROGRESS" },
      { number: 30, name: "[GRAHA II] Sapphire Madani - Pemasangan",                                       status: "ON_PROGRESS" },
      { number: 31, name: "[GRAHA II] Sapphire Riverside - Sumampir (Ex Griya Satria) Dibeli",             status: "ON_PROGRESS" },
      { number: 32, name: "[GRAHA II] Sapphire Riverside - Desain Visual",                                 status: "ON_PROGRESS" },
      { number: 33, name: "[GRAHA II] Sapphire Riverside - Cetak Visual",                                  status: "ON_PROGRESS" },
      { number: 34, name: "[GRAHA II] Sapphire Riverside - Pemasangan",                                    status: "ON_PROGRESS" },
    ],
  },
  {
    pkNumber: 2,
    aps: [
      { number: 14, name: "[GRAHA II] Sapphire Madani - KS Tubun",    status: "ON_PROGRESS" },
      { number: 15, name: "[GRAHA II] Sapphire Madani - Desain Visual", status: "ON_PROGRESS" },
      { number: 16, name: "[GRAHA II] Sapphire Madani - Cetak Visual",  status: "ON_PROGRESS" },
      { number: 17, name: "[GRAHA II] Sapphire Madani - Pemasangan",    status: "ON_PROGRESS" },
    ],
  },
  {
    pkNumber: 3,
    aps: [
      { number: 14, name: "[GRAHA II] Sapphire Madani - Perempatan Tanjung",  status: "ON_PROGRESS" },
      { number: 15, name: "[GRAHA II] Sapphire Madani - Desain Visual",        status: "ON_PROGRESS" },
      { number: 16, name: "[GRAHA II] Sapphire Madani - Cetak Visual",         status: "ON_PROGRESS" },
      { number: 17, name: "[GRAHA II] Sapphire Madani - Pemasangan",           status: "ON_PROGRESS" },
      { number: 18, name: "[GRAHA II] Sapphire Riverside - Sokaraja-Purbalingga", status: "ON_PROGRESS" },
      { number: 19, name: "[GRAHA II] Sapphire Riverside - Desain Visual",     status: "ON_PROGRESS" },
      { number: 20, name: "[GRAHA II] Sapphire Riverside - Cetak Visual",      status: "ON_PROGRESS" },
      { number: 21, name: "[GRAHA II] Sapphire Riverside - Pemasangan",        status: "ON_PROGRESS" },
    ],
  },
];

// ── Graha 3: Detail AP per-cluster (GRAHA III) ────────────────────────────
const GRAHA3_EXTRA: { pkNumber: number; aps: AP[] }[] = [
  {
    pkNumber: 1,
    aps: [
      { number: 35, name: "[GRAHA III] Sapphire Residence Sumbang - Depan Proyek",               status: "ON_PROGRESS" },
      { number: 36, name: "[GRAHA III] Sapphire Residence Sumbang - Desain Visual",               status: "ON_PROGRESS" },
      { number: 37, name: "[GRAHA III] Sapphire Residence Sumbang - Cetak Visual",                status: "ON_PROGRESS" },
      { number: 38, name: "[GRAHA III] Sapphire Residence Sumbang - Pemasangan",                  status: "ON_PROGRESS" },
      { number: 39, name: "[GRAHA III] Sapphire Townhouse Purbalingga - Bobotsari",               status: "ON_PROGRESS" },
      { number: 40, name: "[GRAHA III] Sapphire Townhouse Purbalingga - Desain Visual",           status: "ON_PROGRESS" },
      { number: 41, name: "[GRAHA III] Sapphire Townhouse Purbalingga - Cetak Visual",            status: "ON_PROGRESS" },
      { number: 42, name: "[GRAHA III] Sapphire Townhouse Purbalingga - Pemasangan",              status: "ON_PROGRESS" },
    ],
  },
  {
    pkNumber: 2,
    aps: [
      { number: 18, name: "[GRAHA III] Sapphire Residence Sumbang - Kedungmalang",  status: "ON_PROGRESS" },
      { number: 19, name: "[GRAHA III] Sapphire Residence Sumbang - Desain Visual", status: "ON_PROGRESS" },
      { number: 20, name: "[GRAHA III] Sapphire Residence Sumbang - Cetak Visual",  status: "ON_PROGRESS" },
      { number: 21, name: "[GRAHA III] Sapphire Residence Sumbang - Pemasangan",    status: "ON_PROGRESS" },
    ],
  },
  {
    pkNumber: 3,
    aps: [
      { number: 22, name: "[GRAHA III] Sapphire Residence Sumbang - Depan Pasar Banyumas",  status: "ON_PROGRESS" },
      { number: 23, name: "[GRAHA III] Sapphire Residence Sumbang - Desain Visual",          status: "ON_PROGRESS" },
      { number: 24, name: "[GRAHA III] Sapphire Residence Sumbang - Cetak Visual",           status: "ON_PROGRESS" },
      { number: 25, name: "[GRAHA III] Sapphire Residence Sumbang - Pemasangan",             status: "ON_PROGRESS" },
      { number: 26, name: "[GRAHA III] Sapphire TH Purbalingga - Depan Proyek",              status: "ON_PROGRESS" },
      { number: 27, name: "[GRAHA III] Sapphire TH Purbalingga - Desain Visual",             status: "ON_PROGRESS" },
      { number: 28, name: "[GRAHA III] Sapphire TH Purbalingga - Cetak Visual",              status: "ON_PROGRESS" },
      { number: 29, name: "[GRAHA III] Sapphire TH Purbalingga - Pemasangan",               status: "ON_PROGRESS" },
    ],
  },
];

// ── Graha 4: Detail AP per-cluster (GRAHA IV) ─────────────────────────────
const GRAHA4_EXTRA: { pkNumber: number; aps: AP[] }[] = [
  {
    pkNumber: 1,
    aps: [
      { number: 43, name: "[GRAHA IV] Samara Pegalongan - Sultan Agung (Ex Griya Satria) Dibeli",  status: "ON_PROGRESS" },
      { number: 44, name: "[GRAHA IV] Samara Pegalongan - Desain Visual",                           status: "ON_PROGRESS" },
      { number: 45, name: "[GRAHA IV] Samara Pegalongan - Cetak Visual",                            status: "ON_PROGRESS" },
      { number: 46, name: "[GRAHA IV] Samara Pegalongan - Pemasangan",                              status: "ON_PROGRESS" },
      { number: 47, name: "[GRAHA IV] Sapphire Serenity - Lampu Merah Pegalongan (Jl. Kaliori-Patikraja)", status: "ON_PROGRESS" },
      { number: 48, name: "[GRAHA IV] Sapphire Serenity - Desain Visual",                          status: "ON_PROGRESS" },
      { number: 49, name: "[GRAHA IV] Sapphire Serenity - Cetak Visual",                           status: "ON_PROGRESS" },
      { number: 50, name: "[GRAHA IV] Sapphire Serenity - Pemasangan",                             status: "ON_PROGRESS" },
    ],
  },
  {
    pkNumber: 2,
    aps: [
      { number: 22, name: "[GRAHA IV] Samara Pegalongan - Gunung Tugel (TPA)",  status: "DONE"        },
      { number: 23, name: "[GRAHA IV] Samara Wiradadi - SD Wiradadi",            status: "DONE"        },
      { number: 24, name: "[GRAHA IV] Samara Wiradadi - Jl. Protokol Wiradadi", status: "DONE"        },
      { number: 25, name: "[GRAHA IV] Sapphire Serenity - Depan Proyek",        status: "ON_PROGRESS" },
      { number: 26, name: "[GRAHA IV] Sapphire Serenity - Desain Visual",       status: "ON_PROGRESS" },
      { number: 27, name: "[GRAHA IV] Sapphire Serenity - Cetak Visual",        status: "ON_PROGRESS" },
      { number: 28, name: "[GRAHA IV] Sapphire Serenity - Pemasangan",          status: "ON_PROGRESS" },
    ],
  },
  {
    pkNumber: 3,
    aps: [
      { number: 30, name: "[GRAHA IV] Sapphire Serenity - SMA 4 OVis",     status: "ON_PROGRESS" },
      { number: 31, name: "[GRAHA IV] Sapphire Serenity - Desain Visual",   status: "ON_PROGRESS" },
      { number: 32, name: "[GRAHA IV] Sapphire Serenity - Cetak Visual",    status: "ON_PROGRESS" },
      { number: 33, name: "[GRAHA IV] Sapphire Serenity - Pemasangan",      status: "ON_PROGRESS" },
      { number: 34, name: "[GRAHA IV] Samara Pegalongan - Eka Surya",       status: "ON_PROGRESS" },
      { number: 35, name: "[GRAHA IV] Samara Pegalongan - Desain Visual",   status: "ON_PROGRESS" },
      { number: 36, name: "[GRAHA IV] Samara Pegalongan - Cetak Visual",    status: "ON_PROGRESS" },
      { number: 37, name: "[GRAHA IV] Samara Pegalongan - Pemasangan",      status: "ON_PROGRESS" },
    ],
  },
];

// ── Projects untuk Goffar (semua GRAHA cluster) ───────────────────────────
const GOFFAR_PROJECTS = [
  // GRAHA I
  "Sapphire Townhouse Bumiayu",
  "Samara Bumiayu",
  "Sapphire Residence Ajibarang",
  // GRAHA II
  "Sapphire Madani Purwokerto",
  "Sapphire Mansion Purwokerto",
  "Sapphire Riverside Purwokerto",
  // GRAHA III
  "Sapphire Residence Sumbang",
  "Sapphire Townhouse Purbalingga",
  // GRAHA IV
  "Samara Wiradadi",
  "Samara Pegalongan",
  "Sapphire Serenity",
];

// ── Main ───────────────────────────────────────────────────────────────────
async function main() {
  console.log("🌱 Seeding Monitoring Program Kerja — GM Marketing Graha (Goffar)\n");

  // 1. Division "Bisnis Graha"
  console.log("── Division");
  const division = await prisma.division.upsert({
    where: { name: "Bisnis Graha" },
    create: { name: "Bisnis Graha" },
    update: {},
  });
  console.log(`  ✓ Division: ${division.name} (${division.id})`);

  // 2. User Goffar
  console.log("\n── User");
  const goffar = await prisma.user.findUnique({
    where: { email: "abdulgoffar@siproper.com" },
  });
  if (!goffar) {
    throw new Error("User abdulgoffar@siproper.com tidak ditemukan! Jalankan seed utama terlebih dahulu.");
  }
  console.log(`  ✓ User ditemukan: ${goffar.name} (${goffar.email})`);

  // 3. Period April 2026
  console.log("\n── Period");
  const period = await prisma.period.findUnique({
    where: { year_month: { year: 2026, month: 4 } },
  });
  if (!period) {
    throw new Error("Period April 2026 tidak ditemukan! Jalankan seed utama terlebih dahulu.");
  }
  const weeks = await prisma.week.findMany({
    where: { periodId: period.id },
    orderBy: { weekNumber: "asc" },
  });
  console.log(`  ✓ Period: ${period.name} (${weeks.length} minggu)`);

  // 4. Assign Goffar ke semua proyek Graha
  console.log("\n── Assign proyek ke Goffar");
  let assignCount = 0;
  for (const projName of GOFFAR_PROJECTS) {
    const project = await prisma.project.findUnique({ where: { name: projName } });
    if (!project) {
      console.log(`  ⚠ Proyek tidak ditemukan: ${projName}`);
      continue;
    }
    await prisma.userProject.upsert({
      where: { userId_projectId: { userId: goffar.id, projectId: project.id } },
      create: { userId: goffar.id, projectId: project.id },
      update: {},
    });
    console.log(`  ✓ [${project.cluster}] ${project.name}`);
    assignCount++;
  }
  console.log(`  → Total: ${assignCount} proyek di-assign`);

  // 5. Create Strategies → ProgramKerja → ActionPlan dari AllProject
  console.log("\n── Strategies (AllProject)");
  const strategyMap: Record<number, string> = {}; // stratNumber → stratId
  const pkMap: Record<string, string> = {};        // `stratNumber-pkNumber` → pkId

  for (const strat of STRATEGIES_ALL_PROJECT) {
    const strategy = await prisma.strategy.upsert({
      where: {
        divisionId_periodId_number: {
          divisionId: division.id,
          periodId: period.id,
          number: strat.number,
        },
      },
      create: {
        divisionId: division.id,
        periodId: period.id,
        number: strat.number,
        name: strat.name,
      },
      update: { name: strat.name },
    });
    strategyMap[strat.number] = strategy.id;
    console.log(`\n  ✓ Strategi ${strat.number}: ${strat.name.slice(0, 70)}...`);

    for (const pk of strat.programKerja) {
      const programKerja = await prisma.programKerja.upsert({
        where: {
          strategyId_number: { strategyId: strategy.id, number: pk.number },
        },
        create: {
          strategyId: strategy.id,
          number: pk.number,
          name: pk.name,
          raciAccountable: "GM Marketing",
          raciResponsible: "Manajer Penjualan & Pemasaran",
        },
        update: { name: pk.name },
      });
      pkMap[`${strat.number}-${pk.number}`] = programKerja.id;
      console.log(`    ✓ PK ${pk.number}: ${pk.name.slice(0, 60)}`);

      for (const ap of pk.actionPlans) {
        const actionPlan = await prisma.actionPlan.upsert({
          where: {
            programKerjaId_number: { programKerjaId: programKerja.id, number: ap.number },
          },
          create: { programKerjaId: programKerja.id, number: ap.number, name: ap.name },
          update: { name: ap.name },
        });

        // Set status di WeeklyProgress (gunakan week pertama)
        if (weeks.length > 0 && ap.status !== "NOT_STARTED") {
          await prisma.weeklyProgress.upsert({
            where: {
              actionPlanId_weekId: { actionPlanId: actionPlan.id, weekId: weeks[0].id },
            },
            create: {
              actionPlanId: actionPlan.id,
              weekId: weeks[0].id,
              status: ap.status,
              currentProgress: ap.status === "DONE" ? "Selesai" : "Dalam proses pengerjaan",
            },
            update: { status: ap.status },
          });
        }

        // Mark as planned di timeline (Week 1-2 April)
        for (const w of weeks.slice(0, 2)) {
          await prisma.taskTimeline.upsert({
            where: { actionPlanId_weekId: { actionPlanId: actionPlan.id, weekId: w.id } },
            create: { actionPlanId: actionPlan.id, weekId: w.id, isPlanned: true },
            update: {},
          });
        }
      }
      console.log(`       → ${pk.actionPlans.length} action plans`);
    }
  }

  // 6. Tambahkan detail AP dari Graha 1-4
  console.log("\n── Extra Action Plans (Graha 1-4 detail)");

  type ClusterExtra = { label: string; data: { pkNumber: number; aps: AP[] }[] };
  const clusterExtras: ClusterExtra[] = [
    { label: "GRAHA I",   data: GRAHA1_EXTRA },
    { label: "GRAHA II",  data: GRAHA2_EXTRA },
    { label: "GRAHA III", data: GRAHA3_EXTRA },
    { label: "GRAHA IV",  data: GRAHA4_EXTRA },
  ];

  for (const cluster of clusterExtras) {
    let extraCount = 0;
    for (const extra of cluster.data) {
      const pkId = pkMap[`1-${extra.pkNumber}`]; // semua extra AP ada di Strategi 1
      if (!pkId) {
        console.log(`  ⚠ PK ${extra.pkNumber} tidak ditemukan untuk ${cluster.label}`);
        continue;
      }
      for (const ap of extra.aps) {
        const actionPlan = await prisma.actionPlan.upsert({
          where: { programKerjaId_number: { programKerjaId: pkId, number: ap.number } },
          create: { programKerjaId: pkId, number: ap.number, name: ap.name },
          update: { name: ap.name },
        });

        if (weeks.length > 0 && ap.status !== "NOT_STARTED") {
          await prisma.weeklyProgress.upsert({
            where: { actionPlanId_weekId: { actionPlanId: actionPlan.id, weekId: weeks[0].id } },
            create: {
              actionPlanId: actionPlan.id,
              weekId: weeks[0].id,
              status: ap.status,
              currentProgress: ap.status === "DONE" ? "Selesai" : "Dalam proses",
            },
            update: { status: ap.status },
          });
        }

        for (const w of weeks.slice(0, 2)) {
          await prisma.taskTimeline.upsert({
            where: { actionPlanId_weekId: { actionPlanId: actionPlan.id, weekId: w.id } },
            create: { actionPlanId: actionPlan.id, weekId: w.id, isPlanned: true },
            update: {},
          });
        }
        extraCount++;
      }
    }
    console.log(`  ✓ ${cluster.label}: ${extraCount} extra action plans`);
  }

  // ── Summary ──────────────────────────────────────────────────────────────
  console.log("\n✅ Seeding GM Marketing Graha selesai!");
  console.log("\nRingkasan:");
  console.log(`  Division  : Bisnis Graha`);
  console.log(`  User      : ${goffar.name} (${goffar.email})`);
  console.log(`  Period    : April 2026`);
  console.log(`  Proyek    : ${assignCount} proyek GRAHA (I–IV)`);
  console.log(`  Strategi  : ${STRATEGIES_ALL_PROJECT.length} (dari AllProject)`);
  const totalPK = STRATEGIES_ALL_PROJECT.reduce((s, st) => s + st.programKerja.length, 0);
  const totalAP = STRATEGIES_ALL_PROJECT.reduce(
    (s, st) => s + st.programKerja.reduce((ss, pk) => ss + pk.actionPlans.length, 0),
    0
  );
  const extraTotal = [...GRAHA1_EXTRA, ...GRAHA2_EXTRA, ...GRAHA3_EXTRA, ...GRAHA4_EXTRA]
    .reduce((s, e) => s + e.aps.length, 0);
  console.log(`  Program Kerja (Taktik) : ${totalPK}`);
  console.log(`  Action Plan (AllProject): ${totalAP}`);
  console.log(`  Action Plan (Graha 1-4) : ${extraTotal}`);
  console.log(`  Total Action Plan       : ${totalAP + extraTotal}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
