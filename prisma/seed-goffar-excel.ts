/**
 * Seeder GM Marketing Graha (Goffar) — dari Excel: Monitoring Program Kerja_GM Marketing Graha.xlsx
 * Sheet: AllProject + Graha 1, Graha 2, Graha 3, Graha 4
 *
 * Jalankan: npm run db:seed-goffar-excel
 * PERHATIAN: Akan hapus semua AP existing untuk strategi Bisnis Graha sebelum re-seed.
 */

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  console.log("\n🌱 Seeding GM Marketing Graha (Goffar) dari Excel\n");

  // 1. Find division Bisnis Graha
  const division = await prisma.division.findFirst({ where: { name: "Bisnis Graha" } });
  if (!division) throw new Error("Division Bisnis Graha tidak ditemukan!");
  console.log(`── Division: ${division.name} (${division.id})`);

  // 2. Find Goffar's user
  const goffar = await prisma.user.findFirst({ where: { email: "abdulgoffar@siproper.com" } });
  if (!goffar) throw new Error("User Goffar tidak ditemukan!");
  console.log(`── User: ${goffar.name} (${goffar.id})`);

  // 3. Find base strategies for Bisnis Graha (numbers 1-4)
  const strategies = await prisma.strategy.findMany({
    where: { divisionId: division.id, number: { lte: 4 } },
    include: { programKerja: { orderBy: { number: "asc" } } },
    orderBy: { number: "asc" },
  });
  console.log(`── Strategies: ${strategies.length} ditemukan`);

  // 4. Build AP data dari Excel (defined below, processing starts after)

  // Data AllProject: {stratNo → {pkNo → [aps]}}
  const allProjectData: Record<number, Record<number, { pkName: string; aps: { number: number; name: string; status: string }[] }>> = {
    1: {
      1: {
        pkName: "Revisual 18 Baliho 4x6 Existing (Pribadi)",
        aps: [
          { number: 1, name: "Sapphire Townhouse Bumiayu - Jl. Lingkar Bumiayu (Lampu Baliho)", status: "ON_PROGRESS" },
          { number: 2, name: "Samara Village Bumiayu - Depan Proyek", status: "ON_PROGRESS" },
          { number: 3, name: "Sapphire Madani - Depan Proyek", status: "ON_PROGRESS" },
          { number: 4, name: "Sapphire Riverside  - Kedungmalang", status: "ON_PROGRESS" },
          { number: 5, name: "Sapphire Riverside  - UHB", status: "ON_PROGRESS" },
          { number: 6, name: "Sapphire Madani - Mitra 10", status: "ON_PROGRESS" },
          { number: 7, name: "Sapphire Madani - Karanggude", status: "ON_PROGRESS" },
          { number: 8, name: "Sapphire Riverside  - Tugu Adipura Berkoh", status: "ON_PROGRESS" },
          { number: 9, name: "Sapphire Residence Sumbang - Kedungmalang", status: "ON_PROGRESS" },
          { number: 10, name: "Sapphire Residance Sumbang - Depan Proyek", status: "ON_PROGRESS" },
          { number: 11, name: "Sapphire Residence Sumbang - Karangcegak", status: "ON_PROGRESS" },
          { number: 12, name: "Sapphire Residence Sumbang - UHB", status: "ON_PROGRESS" },
          { number: 13, name: "Sapphire Residence Sumbang - Tugu Adipura Berkoh", status: "ON_PROGRESS" },
          { number: 14, name: "Sapphire Townhouse Purbalingga - Bobotsari", status: "ON_PROGRESS" },
          { number: 15, name: "Sapphire Townhouse Purbalingga - Soemarmo Square", status: "ON_PROGRESS" },
          { number: 16, name: "Sapphire Serenity - Depan Proyek", status: "ON_PROGRESS" },
          { number: 17, name: "Sapphire Serenity - Lampu Merah Pegalongan", status: "ON_PROGRESS" },
          { number: 18, name: "Sapphire Serenity - Mitra 10", status: "ON_PROGRESS" },
        ],
      },
      2: {
        pkName: "Revisual 9 Baliho SELAIN 4x6 Existing (Pribadi)",
        aps: [
          { number: 1, name: "Sapphire Townhouse Bumiayu - BRI Kalierang", status: "ON_PROGRESS" },
          { number: 2, name: "Samara Village Bumiayu - Pertigaan Jl Lapangan Asri", status: "ON_PROGRESS" },
          { number: 3, name: "Sapphire Madani - Sapphire KS Tubun", status: "ON_PROGRESS" },
          { number: 4, name: "Sapphire Madani - Utara Amira Clasic (Jl KS Tubun)", status: "ON_PROGRESS" },
          { number: 5, name: "Sapphire Madani - Sapphire Village", status: "ON_PROGRESS" },
          { number: 6, name: "Sapphire Townhouse Purbalingga - Depan Proyek", status: "ON_PROGRESS" },
          { number: 7, name: "Samara Pegalongan - Gunung Tugel (TPA)", status: "DONE" },
          { number: 8, name: "Samara Asri Wiradadi - SD Wiradadi", status: "DONE" },
          { number: 9, name: "Samara Asri Wiradadi - Jl Protokol Wiradadi", status: "DONE" },
          { number: 1, name: "Sapphire Town House Bumiayu - Deket polsek Bumiayu", status: "ON_PROGRESS" },
          { number: 2, name: "Sapphire Riverside  - Pertigaan Sokaraja-Purbalingga", status: "ON_PROGRESS" },
          { number: 3, name: "Sapphire Madani - Perempatan Tanjung (sebelah Pos Polisi)", status: "ON_PROGRESS" },
          { number: 4, name: "Sapphire Madani - Radius Pasar Manis", status: "ON_PROGRESS" },
          { number: 5, name: "Sapphire Riverside  - Tugu Sakanti Dahana Patra (Tugu Lilin Gumilir - Cilacap)", status: "ON_PROGRESS" },
          { number: 6, name: "Sapphire Town House Purbalingga - Eka Surya Purbalingga", status: "ON_PROGRESS" },
          { number: 7, name: "Sapphire Town House Purbalingga - Mayjen Sungkono", status: "ON_PROGRESS" },
          { number: 8, name: "Sapphire Residence Sumbang - Depan Pasar Banyumas", status: "ON_PROGRESS" },
          { number: 9, name: "Sapphire Serenity - SMA 4 - OVis", status: "ON_PROGRESS" },
        ],
      },
      3: {
        pkName: "Pemasangan Zenith CGR di 6 projek Existing (Konsep Mahasiswa, Konsumen Existing, Kawasan)",
        aps: [
          { number: 1, name: "12 Titik Sapphire Madani (fomasi 4:4:4)", status: "ON_PROGRESS" },
          { number: 2, name: "4 Titik Sapphire Riverside (formasi 3:1:0)", status: "ON_PROGRESS" },
          { number: 3, name: "3 Titik Sapphire TownHouse Bumiayu (Formasi 1:1:1)", status: "ON_PROGRESS" },
          { number: 4, name: "8 Titik Sapphire Residence Sumbang (Formasi 2:3:3)", status: "ON_PROGRESS" },
          { number: 5, name: "5 Titik Sapphire TH Purbalingga  (Formasi 1:2:2)", status: "ON_PROGRESS" },
          { number: 6, name: "Pemasangan 3 Titik Baru di Samara Village Bumiayu (Formasi 1:1:1)", status: "ON_PROGRESS" },
          { number: 7, name: "Revisual Zenith Taman Langit", status: "ON_PROGRESS" },
          { number: 8, name: "Pemasangan Zenith Ajibarang depan (Zamrud) 2; belakang (Ruby) 1", status: "ON_PROGRESS" },
        ],
      },
      4: {
        pkName: "Pemasangan Zenith CGR di 3 projek Lama (Konsep Mahasiswa, Konsumen Existing, Kawasan)",
        aps: [
          { number: 1, name: "Pemasangan 4 Titik Baru di Sapphire Residence Karangwangkal (2:2)", status: "ON_PROGRESS" },
          { number: 2, name: "Pemasangan 4 Titik Baru di Sapphire KS Tubun (2:2)", status: "ON_PROGRESS" },
          { number: 3, name: "Pemasangan 4 Titik Baru di Sapphire Estate Sumampir (2:2)", status: "ON_PROGRESS" },
        ],
      },
      5: {
        pkName: "Pemindahan 11 Mini Baliho di Bale Hinggil",
        aps: [
          { number: 1, name: "6 mini baligho di ajibarang blok Zamrud", status: "ON_PROGRESS" },
          { number: 2, name: "5 mini baligho di ajibarang blok Ruby", status: "ON_PROGRESS" },
        ],
      },
    },
    2: {
      1: {
        pkName: "Perkuat Branding dengan strategy Organik (Konten sosmed)",
        aps: [
          { number: 1, name: "16 Konten Soft Selling dan Hard Selling reguler", status: "ON_PROGRESS" },
        ],
      },
      2: {
        pkName: "Dongkrak Interasi dan Konversi menggunakan Strategy Ads",
        aps: [
          { number: 1, name: "Dioptimasi/REM Budget", status: "ON_PROGRESS" },
          { number: 2, name: "Dioptimasi & Monitoring", status: "ON_PROGRESS" },
          { number: 3, name: "Murah (WAJIB DIGAS)", status: "ON_PROGRESS" },
          { number: 4, name: "Jalan campaign retargeting", status: "ON_PROGRESS" },
        ],
      },
      3: {
        pkName: "Masifkan Kolaborasi dengan Akun Medsos Pihak Ketiga",
        aps: [
          { number: 1, name: "Paid Promote Media Lokal & KOL", status: "ON_PROGRESS" },
          { number: 2, name: "Collab Post", status: "ON_PROGRESS" },
        ],
      },
      4: {
        pkName: "Kelola Customer menggunakan strategi CRM",
        aps: [
          { number: 1, name: "Kelola data customer dengan membuat Channel", status: "ON_PROGRESS" },
          { number: 2, name: "Survei Kepuasan Konsumen Booking setiap bulan", status: "ON_PROGRESS" },
          { number: 3, name: "Survei Kepuasan Konsumen BAST setiap bulan", status: "ON_PROGRESS" },
          { number: 4, name: "Survei Kepuasan Konsumen Akad setiap bulan", status: "ON_PROGRESS" },
          { number: 5, name: "Program Birthday/touch point untuk konsumen vip existing", status: "ON_PROGRESS" },
          { number: 6, name: "Email Marketing", status: "ON_PROGRESS" },
        ],
      },
    },
    3: {
      1: {
        pkName: "MoU Branding - KAI Purwokerto",
        aps: [
          { number: 1, name: "Promosi Visual di Area Indoor dan Outdoor Stasiun", status: "ON_PROGRESS" },
        ],
      },
      2: {
        pkName: "MoU Branding - KAI Kroya",
        aps: [
          { number: 2, name: "Promosi Visual di Area Indoor dan Outdoor Stasiun", status: "ON_PROGRESS" },
        ],
      },
      3: {
        pkName: "MoU Branding - KAI Bumiayu",
        aps: [
          { number: 3, name: "Promosi Visual di Area Indoor dan Outdoor Stasiun", status: "ON_PROGRESS" },
        ],
      },
      4: {
        pkName: "MoU Yu Skin",
        aps: [
          { number: 4, name: "kerjasama pemasaran", status: "ON_PROGRESS" },
        ],
      },
      5: {
        pkName: "MoU Taman Langit",
        aps: [
          { number: 5, name: "Pemasangan Totem/SignAge Digital di area lobby/resto dan promosi di TV Promosional Channel", status: "ON_PROGRESS" },
        ],
      },
      6: {
        pkName: "MoU Bioskop CGV",
        aps: [
          { number: 6, name: "Pasang Iklan Di Bioskop", status: "ON_PROGRESS" },
        ],
      },
      7: {
        pkName: "MoU Rita Mall",
        aps: [
          { number: 7, name: "Promosi Visual di Area Indoor dan Outdoor", status: "ON_PROGRESS" },
        ],
      },
      8: {
        pkName: "MoU Hotel Luminor",
        aps: [
          { number: 8, name: "Pemasangan Totem/SignAge Digital di area lobby/resto dan promosi di In-Room Promosional Channel", status: "ON_PROGRESS" },
        ],
      },
      9: {
        pkName: "MoU Hotel  Java Heritage",
        aps: [
          { number: 9, name: "Pemasangan Totem/SignAge Digital di area lobby/resto dan promosi di In-Room Promosional Channel", status: "ON_PROGRESS" },
        ],
      },
      10: {
        pkName: "MoU Hotel  Dominic (Hotel DM)",
        aps: [
          { number: 10, name: "Pemasangan Totem/SignAge Digital di area lobby/resto dan promosi di In-Room Promosional Channel", status: "ON_PROGRESS" },
        ],
      },
      11: {
        pkName: "MoU Hotel Toyo",
        aps: [
          { number: 11, name: "Pemasangan Totem/SignAge Digital di area lobby/resto dan promosi di In-Room Promosional Channel", status: "ON_PROGRESS" },
        ],
      },
      12: {
        pkName: "MoU Hotel Meotel",
        aps: [
          { number: 12, name: "Pemasangan Totem/SignAge Digital di area lobby/resto dan promosi di In-Room Promosional Channel", status: "ON_PROGRESS" },
        ],
      },
      13: {
        pkName: "MoU Hotel COR",
        aps: [
          { number: 13, name: "Pemasangan Totem/SignAge Digital di area lobby/resto dan promosi di In-Room Promosional Channel", status: "ON_PROGRESS" },
        ],
      },
      14: {
        pkName: "MoU Braling Grand Hotel",
        aps: [
          { number: 14, name: "Pemasangan Totem/SignAge Digital di area lobby/resto dan promosi di In-Room Promosional Channel", status: "ON_PROGRESS" },
        ],
      },
      15: {
        pkName: "MoU Bank BTN",
        aps: [
          { number: 15, name: "Pemasangkan Totem/SignAge DIgital & x banner di cabang2", status: "ON_PROGRESS" },
        ],
      },
      16: {
        pkName: "MoU Bank Mandiri",
        aps: [
          { number: 16, name: "Pemasangkan Totem/SignAge DIgital & x banner di cabang2", status: "ON_PROGRESS" },
        ],
      },
      17: {
        pkName: "MoU Bank BSI",
        aps: [
          { number: 17, name: "Pemasangkan Totem/SignAge DIgital & x banner di cabang2", status: "ON_PROGRESS" },
        ],
      },
      18: {
        pkName: "MoU Bank BRI",
        aps: [
          { number: 18, name: "Pemasangkan Totem/SignAge DIgital & x banner di cabang2", status: "ON_PROGRESS" },
        ],
      },
      19: {
        pkName: "MoU Bank BPD",
        aps: [
          { number: 19, name: "Pemasangkan Totem/SignAge DIgital & x banner di cabang2", status: "ON_PROGRESS" },
        ],
      },
      20: {
        pkName: "MoU RSIA Bunda Arif",
        aps: [
          { number: 20, name: "Program KPR Promo, Pemasangan Totem dan aktivitas pemasaran", status: "DONE" },
        ],
      },
      21: {
        pkName: "MoU Gym Nest",
        aps: [
          { number: 21, name: "Pemasangan Totem, Partnership dan referal", status: "ON_PROGRESS" },
        ],
      },
    },
    4: {
      1: {
        pkName: "Peringatan Hari besar",
        aps: [
          { number: 1, name: "Hari Konsumen, Hari Kartini, Hari Bumi", status: "DONE" },
        ],
      },
      2: {
        pkName: "Event Offline dengan berfokus pada output leads dan refferal",
        aps: [
          { number: 1, name: "Open House", status: "ON_PROGRESS" },
          { number: 2, name: "Fun Run Town House Purbalingga", status: "ON_PROGRESS" },
        ],
      },
      3: {
        pkName: "Event CGR",
        aps: [
          { number: 1, name: "seminar / gathering di lokasi proyek dengan gandeng perbankan & you skin & TaLa", status: "ON_PROGRESS" },
          { number: 2, name: "video testimoni konsumen2 terpilih dengan di berikan reward bingkisan", status: "ON_PROGRESS" },
        ],
      },
      4: {
        pkName: "Event CFD",
        aps: [
          { number: 1, name: "Branding di alun2 dengan mobil branding BYD", status: "ON_PROGRESS" },
        ],
      },
      5: {
        pkName: "event Kollaborasi dengan all mitra perbankan",
        aps: [
          { number: 1, name: "kunjungan dan sosialisasi dengan gandeng mitra perbankan", status: "ON_PROGRESS" },
        ],
      },
      6: {
        pkName: "Event kolaborasi dengan komunitas",
        aps: [
          { number: 1, name: "komunitas lari", status: "ON_PROGRESS" },
          { number: 2, name: "komunitas otomotif", status: "ON_PROGRESS" },
          { number: 3, name: "komunitas sepeda", status: "ON_PROGRESS" },
        ],
      },
    },
  };

  // Data Graha per cluster: [{strat_no, pk_no, seq, name}]
  const grahaiData: Array<{ strat_no: number; pk_no: number; seq: number; name: string; keterangan: string }> = [
    { strat_no: 1, pk_no: 1, seq: 1, name: "[GRAHA I] Samara Village - Samara Village", keterangan: "Jln Lingkar Bumiayu (Depan Proyek)" },
    { strat_no: 1, pk_no: 1, seq: 2, name: "[GRAHA I] Desain Visual", keterangan: "" },
    { strat_no: 1, pk_no: 1, seq: 3, name: "[GRAHA I] Cetak Visual", keterangan: "" },
    { strat_no: 1, pk_no: 1, seq: 4, name: "[GRAHA I] Pemasangan", keterangan: "" },
    { strat_no: 1, pk_no: 1, seq: 5, name: "[GRAHA I] Sapphire Town House Bumiayu - Sapphire Town House Bumiayu", keterangan: "Jln Lingkar Bumiayu (Depan Proyek)" },
    { strat_no: 1, pk_no: 1, seq: 6, name: "[GRAHA I] Desain Visual", keterangan: "" },
    { strat_no: 1, pk_no: 1, seq: 7, name: "[GRAHA I] Cetak Visual", keterangan: "" },
    { strat_no: 1, pk_no: 1, seq: 8, name: "[GRAHA I] Pemasangan", keterangan: "" },
    { strat_no: 1, pk_no: 2, seq: 1, name: "[GRAHA I] Mini Billboard Sapphire Town House Bumiayu 1x2, 2 muka", keterangan: "Pertigaan toko sidodadi    (Ketutup Baliho Pegadaian)" },
    { strat_no: 1, pk_no: 2, seq: 2, name: "[GRAHA I] Desain Visual", keterangan: "" },
    { strat_no: 1, pk_no: 2, seq: 3, name: "[GRAHA I] Cetak Visual", keterangan: "" },
    { strat_no: 1, pk_no: 2, seq: 4, name: "[GRAHA I] Pemasangan", keterangan: "" },
    { strat_no: 1, pk_no: 2, seq: 5, name: "[GRAHA I] Sapphire Town House Bumiayu - Pasar Bumiayu", keterangan: "" },
    { strat_no: 1, pk_no: 2, seq: 6, name: "[GRAHA I] Desain Visual", keterangan: "" },
    { strat_no: 1, pk_no: 2, seq: 7, name: "[GRAHA I] Cetak Visual", keterangan: "" },
    { strat_no: 1, pk_no: 2, seq: 8, name: "[GRAHA I] Pemasangan", keterangan: "" },
    { strat_no: 1, pk_no: 3, seq: 1, name: "[GRAHA I] 3 Titik Sapphire TownHouse Bumiayu (Formasi 0:3:0)", keterangan: "Revisual" },
    { strat_no: 1, pk_no: 3, seq: 2, name: "[GRAHA I] Desain Visual", keterangan: "" },
    { strat_no: 1, pk_no: 3, seq: 3, name: "[GRAHA I] Cetak Visual", keterangan: "" },
    { strat_no: 1, pk_no: 3, seq: 4, name: "[GRAHA I] Pemasangan", keterangan: "" },
    { strat_no: 1, pk_no: 3, seq: 5, name: "[GRAHA I] Pemasangan 3 Titik Baru di Samara Village Bumiayu (Formasi 0:1:2)", keterangan: "Pemasangan Baru" },
    { strat_no: 1, pk_no: 3, seq: 6, name: "[GRAHA I] Desain Visual", keterangan: "Produksi Baru" },
    { strat_no: 1, pk_no: 3, seq: 7, name: "[GRAHA I] Cetak Visual", keterangan: "" },
    { strat_no: 1, pk_no: 3, seq: 8, name: "[GRAHA I] Prorduksi 3 Rangka Samara Village", keterangan: "" },
    { strat_no: 1, pk_no: 3, seq: 9, name: "[GRAHA I] Pemasangan", keterangan: "" },
    { strat_no: 1, pk_no: 3, seq: 10, name: "[GRAHA I] Pemasangan Zenith Ajibarang depan (Zamrud) 2 ; belakang (Ruby) 1 (formasi 0:3:0)", keterangan: "Produksi Baru" },
    { strat_no: 1, pk_no: 3, seq: 11, name: "[GRAHA I] Prorduksi 3 Rangka Ajibarang", keterangan: "2 Relokasi dari TH Bumiayu, 1 Produksi baru" },
    { strat_no: 1, pk_no: 3, seq: 12, name: "[GRAHA I] Cetak Visual", keterangan: "" },
    { strat_no: 1, pk_no: 3, seq: 13, name: "[GRAHA I] Desain Visual", keterangan: "" },
    { strat_no: 1, pk_no: 3, seq: 14, name: "[GRAHA I] Pemasangan", keterangan: "" },
    { strat_no: 1, pk_no: 4, seq: 1, name: "[GRAHA I] Relokasi & Pemasangan 11 Titik ke Ajibarang", keterangan: "" },
    { strat_no: 1, pk_no: 4, seq: 2, name: "[GRAHA I] Cetak Visual", keterangan: "" },
    { strat_no: 1, pk_no: 4, seq: 3, name: "[GRAHA I] Desain Visual", keterangan: "" },
    { strat_no: 1, pk_no: 4, seq: 4, name: "[GRAHA I] Pemasangan", keterangan: "" },
    { strat_no: 2, pk_no: 1, seq: 1, name: "[GRAHA I] Tour Kawasan Samara Village Bumiayu", keterangan: "" },
    { strat_no: 2, pk_no: 1, seq: 2, name: "[GRAHA I] Yang Perlu Dicek dari Progress Kawasan Itu Bukan Bangunannya Aja", keterangan: "" },
    { strat_no: 2, pk_no: 1, seq: 3, name: "[GRAHA I] Kavling vs Rumah Jadi: Cocoknya untuk Siapa?", keterangan: "" },
    { strat_no: 2, pk_no: 1, seq: 4, name: "[GRAHA I] Progress Pembangunan Rumah Sapphire Townhouse Bumiayu  (Timelapse)", keterangan: "" },
    { strat_no: 2, pk_no: 2, seq: 1, name: "[GRAHA I] Dioptimasi/REM Budget", keterangan: "" },
    { strat_no: 2, pk_no: 2, seq: 2, name: "[GRAHA I] - Townhouse Purbalingga", keterangan: "" },
    { strat_no: 2, pk_no: 2, seq: 3, name: "[GRAHA I] Murah (WAJIB DIGAS)", keterangan: "" },
    { strat_no: 2, pk_no: 2, seq: 4, name: "[GRAHA I] - Samara Village Bumiayu", keterangan: "" },
    { strat_no: 2, pk_no: 2, seq: 5, name: "[GRAHA I] Jalan campaign retargeting", keterangan: "" },
    { strat_no: 2, pk_no: 3, seq: 1, name: "[GRAHA I] Paid Promote Media Lokal", keterangan: "" },
    { strat_no: 2, pk_no: 3, seq: 2, name: "[GRAHA I] - Info Purwokerto", keterangan: "" },
    { strat_no: 2, pk_no: 3, seq: 3, name: "[GRAHA I] - Purwokerto City", keterangan: "" },
    { strat_no: 2, pk_no: 3, seq: 4, name: "[GRAHA I] Collab Post", keterangan: "" },
    { strat_no: 2, pk_no: 3, seq: 5, name: "[GRAHA I] - Institusi (DLH)", keterangan: "" },
    { strat_no: 2, pk_no: 3, seq: 6, name: "[GRAHA I] - Brand (Tala, Dr Yuskin, Pintu Berdikari)", keterangan: "" },
    { strat_no: 2, pk_no: 4, seq: 1, name: "[GRAHA I] Kelola data customer dengan membuat Channel", keterangan: "" },
    { strat_no: 2, pk_no: 4, seq: 2, name: "[GRAHA I] - Kelola data CS Mol (Cold Warm Hot)", keterangan: "" },
    { strat_no: 2, pk_no: 4, seq: 3, name: "[GRAHA I] - Kelola WA Channel", keterangan: "" },
    { strat_no: 2, pk_no: 4, seq: 4, name: "[GRAHA I] - Kelola IG Channel", keterangan: "" },
    { strat_no: 2, pk_no: 5, seq: 1, name: "[GRAHA I] Survei Kepuasan Konsumen Booking", keterangan: "" },
    { strat_no: 2, pk_no: 6, seq: 1, name: "[GRAHA I] Survei Kepuasan Konsumen BAST", keterangan: "" },
    { strat_no: 2, pk_no: 7, seq: 1, name: "[GRAHA I] Program Birthday/touch point untuk konsumen vip existing", keterangan: "" },
    { strat_no: 3, pk_no: 1, seq: 1, name: "[GRAHA I] Pemasangkan Totem/SignAge DIgital", keterangan: "" },
    { strat_no: 3, pk_no: 2, seq: 1, name: "[GRAHA I] Pemasangkan Totem/SignAge DIgital", keterangan: "" },
    { strat_no: 3, pk_no: 3, seq: 1, name: "[GRAHA I] Pemasangkan Totem/SignAge DIgital", keterangan: "" },
    { strat_no: 4, pk_no: 1, seq: 1, name: "[GRAHA I] Hari Konsumen, Hari Kartini, Hari Bumi", keterangan: "" },
    { strat_no: 4, pk_no: 2, seq: 1, name: "[GRAHA I] Open House", keterangan: "" },
  ];
  const grahaiiData: Array<{ strat_no: number; pk_no: number; seq: number; name: string; keterangan: string }> = [
    { strat_no: 1, pk_no: 1, seq: 1, name: "[GRAHA II] Sapphire Madani - Pasar Notog (Replace rencana pasang di Cilacap)", keterangan: "" },
    { strat_no: 1, pk_no: 1, seq: 2, name: "[GRAHA II] Desain Visual", keterangan: "" },
    { strat_no: 1, pk_no: 1, seq: 3, name: "[GRAHA II] Cetak Visual", keterangan: "" },
    { strat_no: 1, pk_no: 1, seq: 4, name: "[GRAHA II] Pemasangan", keterangan: "" },
    { strat_no: 1, pk_no: 1, seq: 5, name: "[GRAHA II] Sapphire Riverside - Sumampir (Ex Griya Satria) (Dibeli)", keterangan: "" },
    { strat_no: 1, pk_no: 1, seq: 6, name: "[GRAHA II] Desain Visual", keterangan: "" },
    { strat_no: 1, pk_no: 1, seq: 7, name: "[GRAHA II] Cetak Visual", keterangan: "" },
    { strat_no: 1, pk_no: 1, seq: 8, name: "[GRAHA II] Pemasangan", keterangan: "" },
    { strat_no: 1, pk_no: 1, seq: 9, name: "[GRAHA II] Sapphire Riverside - Univ Harapan Bangsa", keterangan: "" },
    { strat_no: 1, pk_no: 1, seq: 10, name: "[GRAHA II] Desain Visual", keterangan: "" },
    { strat_no: 1, pk_no: 1, seq: 11, name: "[GRAHA II] Cetak Visual", keterangan: "" },
    { strat_no: 1, pk_no: 1, seq: 12, name: "[GRAHA II] Pemasangan", keterangan: "" },
    { strat_no: 1, pk_no: 1, seq: 13, name: "[GRAHA II] Sapphire Madani - Karanggude", keterangan: "" },
    { strat_no: 1, pk_no: 1, seq: 14, name: "[GRAHA II] Desain Visual", keterangan: "" },
    { strat_no: 1, pk_no: 1, seq: 15, name: "[GRAHA II] Cetak Visual", keterangan: "" },
    { strat_no: 1, pk_no: 1, seq: 16, name: "[GRAHA II] Pemasangan", keterangan: "" },
    { strat_no: 1, pk_no: 1, seq: 17, name: "[GRAHA II] Sapphire Residence Sumbang - Sapphire Riverside - Sunan Ampel, Kedung Malang", keterangan: "" },
    { strat_no: 1, pk_no: 1, seq: 18, name: "[GRAHA II] Desain Visual", keterangan: "" },
    { strat_no: 1, pk_no: 1, seq: 19, name: "[GRAHA II] Cetak Visual", keterangan: "" },
    { strat_no: 1, pk_no: 1, seq: 20, name: "[GRAHA II] Pemasangan", keterangan: "" },
    { strat_no: 1, pk_no: 1, seq: 21, name: "[GRAHA II] Sapphire Madani - Sapphire Madani", keterangan: "" },
    { strat_no: 1, pk_no: 1, seq: 22, name: "[GRAHA II] Desain Visual", keterangan: "" },
    { strat_no: 1, pk_no: 1, seq: 23, name: "[GRAHA II] Cetak Visual", keterangan: "" },
    { strat_no: 1, pk_no: 1, seq: 24, name: "[GRAHA II] Pemasangan", keterangan: "" },
    { strat_no: 1, pk_no: 2, seq: 1, name: "[GRAHA II] Sapphire Madani - Sapphire Regency KS Tubun", keterangan: "" },
    { strat_no: 1, pk_no: 2, seq: 2, name: "[GRAHA II] Desain Visual", keterangan: "" },
    { strat_no: 1, pk_no: 2, seq: 3, name: "[GRAHA II] Cetak Visual", keterangan: "" },
    { strat_no: 1, pk_no: 2, seq: 4, name: "[GRAHA II] Pemasangan", keterangan: "" },
    { strat_no: 1, pk_no: 2, seq: 5, name: "[GRAHA II] Sapphire Madani - Utara Amira Klasik (Jl KS Tubun)", keterangan: "" },
    { strat_no: 1, pk_no: 2, seq: 6, name: "[GRAHA II] Desain Visual", keterangan: "" },
    { strat_no: 1, pk_no: 2, seq: 7, name: "[GRAHA II] Cetak Visual", keterangan: "" },
    { strat_no: 1, pk_no: 2, seq: 8, name: "[GRAHA II] Pemasangan", keterangan: "" },
    { strat_no: 1, pk_no: 2, seq: 9, name: "[GRAHA II] Sapphire Madani - Sapphire Village", keterangan: "" },
    { strat_no: 1, pk_no: 2, seq: 10, name: "[GRAHA II] Desain Visual", keterangan: "" },
    { strat_no: 1, pk_no: 2, seq: 11, name: "[GRAHA II] Cetak Visual", keterangan: "" },
    { strat_no: 1, pk_no: 2, seq: 12, name: "[GRAHA II] Pemasangan", keterangan: "" },
    { strat_no: 1, pk_no: 3, seq: 1, name: "[GRAHA II] Sapphire Riverside - Perempatan Sokaraja", keterangan: "" },
    { strat_no: 1, pk_no: 3, seq: 2, name: "[GRAHA II] Desain Visual", keterangan: "" },
    { strat_no: 1, pk_no: 3, seq: 3, name: "[GRAHA II] Cetak Visual", keterangan: "" },
    { strat_no: 1, pk_no: 3, seq: 4, name: "[GRAHA II] Pemasangan", keterangan: "" },
    { strat_no: 1, pk_no: 3, seq: 5, name: "[GRAHA II] Sapphire Madani - Pasar Banyumas", keterangan: "" },
    { strat_no: 1, pk_no: 3, seq: 6, name: "[GRAHA II] Desain Visual", keterangan: "" },
    { strat_no: 1, pk_no: 3, seq: 7, name: "[GRAHA II] Cetak Visual", keterangan: "" },
    { strat_no: 1, pk_no: 3, seq: 8, name: "[GRAHA II] Pemasangan", keterangan: "" },
    { strat_no: 1, pk_no: 3, seq: 9, name: "[GRAHA II] Sapphire Riverside - Tugu Lilin Gumilir, Cilacap", keterangan: "" },
    { strat_no: 1, pk_no: 3, seq: 10, name: "[GRAHA II] Desain Visual", keterangan: "" },
    { strat_no: 1, pk_no: 3, seq: 11, name: "[GRAHA II] Cetak Visual", keterangan: "" },
    { strat_no: 1, pk_no: 3, seq: 12, name: "[GRAHA II] Pemasangan", keterangan: "" },
    { strat_no: 1, pk_no: 3, seq: 13, name: "[GRAHA II] Riverside - Sapphire Serenity - Aston arah Unsoed", keterangan: "" },
    { strat_no: 1, pk_no: 3, seq: 14, name: "[GRAHA II] Desain Visual", keterangan: "" },
    { strat_no: 1, pk_no: 3, seq: 15, name: "[GRAHA II] Cetak Visual", keterangan: "" },
    { strat_no: 1, pk_no: 3, seq: 16, name: "[GRAHA II] Pemasangan", keterangan: "" },
    { strat_no: 1, pk_no: 3, seq: 17, name: "[GRAHA II] Sapphire Madani - Underpass", keterangan: "" },
    { strat_no: 1, pk_no: 3, seq: 18, name: "[GRAHA II] Desain Visual", keterangan: "" },
    { strat_no: 1, pk_no: 3, seq: 19, name: "[GRAHA II] Cetak Visual", keterangan: "" },
    { strat_no: 1, pk_no: 3, seq: 20, name: "[GRAHA II] Pemasangan", keterangan: "" },
    { strat_no: 1, pk_no: 4, seq: 1, name: "[GRAHA II] 12 Titik Sapphire Madani (fomasi 1:4:7)", keterangan: "" },
    { strat_no: 1, pk_no: 4, seq: 2, name: "[GRAHA II] Desain Visual", keterangan: "" },
    { strat_no: 1, pk_no: 4, seq: 3, name: "[GRAHA II] Cetak Visual", keterangan: "" },
    { strat_no: 1, pk_no: 4, seq: 4, name: "[GRAHA II] Pemasangan", keterangan: "" },
    { strat_no: 1, pk_no: 4, seq: 5, name: "[GRAHA II] 4 Titik Sapphire Riverside (formasi 1:1:2)", keterangan: "" },
    { strat_no: 1, pk_no: 4, seq: 6, name: "[GRAHA II] Desain Visual", keterangan: "" },
    { strat_no: 1, pk_no: 4, seq: 7, name: "[GRAHA II] Cetak Visual", keterangan: "" },
    { strat_no: 1, pk_no: 4, seq: 8, name: "[GRAHA II] Pemasangan", keterangan: "" },
    { strat_no: 1, pk_no: 5, seq: 1, name: "[GRAHA II] Pemasangan 2 Titik Baru di Sapphire Residence Karangwangkal (1:1)", keterangan: "" },
    { strat_no: 1, pk_no: 5, seq: 2, name: "[GRAHA II] Prorduksi 2 Rangka", keterangan: "" },
    { strat_no: 1, pk_no: 5, seq: 3, name: "[GRAHA II] Cetak Visual", keterangan: "" },
    { strat_no: 1, pk_no: 5, seq: 4, name: "[GRAHA II] Desain Visual", keterangan: "" },
    { strat_no: 1, pk_no: 5, seq: 5, name: "[GRAHA II] Pemasangan", keterangan: "" },
    { strat_no: 1, pk_no: 5, seq: 6, name: "[GRAHA II] Pemasangan 2 Titik Baru di Sapphire KS Tubun (1:1)", keterangan: "" },
    { strat_no: 1, pk_no: 5, seq: 7, name: "[GRAHA II] Prorduksi 2 Rangka", keterangan: "" },
    { strat_no: 1, pk_no: 5, seq: 8, name: "[GRAHA II] Cetak Visual", keterangan: "" },
    { strat_no: 1, pk_no: 5, seq: 9, name: "[GRAHA II] Desain Visual", keterangan: "" },
    { strat_no: 1, pk_no: 5, seq: 10, name: "[GRAHA II] Pemasangan", keterangan: "" },
    { strat_no: 1, pk_no: 5, seq: 11, name: "[GRAHA II] Pemasangan 2 Titik Baru di Sapphire Estate Sumampir (1:1)", keterangan: "" },
    { strat_no: 1, pk_no: 5, seq: 12, name: "[GRAHA II] Prorduksi 2 Rangka", keterangan: "" },
    { strat_no: 1, pk_no: 5, seq: 13, name: "[GRAHA II] Cetak Visual", keterangan: "" },
    { strat_no: 1, pk_no: 5, seq: 14, name: "[GRAHA II] Desain Visual", keterangan: "" },
    { strat_no: 1, pk_no: 5, seq: 15, name: "[GRAHA II] Pemasangan", keterangan: "" },
    { strat_no: 2, pk_no: 1, seq: 1, name: "[GRAHA II] Progress Kawasan Sapphire Riverside", keterangan: "" },
    { strat_no: 2, pk_no: 1, seq: 2, name: "[GRAHA II] Emas Tinggi, BTC Naik-Turun, Rumah Harus Dilihat dari Sudut Mana?", keterangan: "" },
    { strat_no: 2, pk_no: 1, seq: 3, name: "[GRAHA II] Kosan Full Furnished Riverside", keterangan: "" },
    { strat_no: 2, pk_no: 1, seq: 4, name: "[GRAHA II] Progress Pembangunan Rumah Sapphire Riverside  (Timelapse)", keterangan: "" },
    { strat_no: 2, pk_no: 2, seq: 1, name: "[GRAHA II] Dioptimasi & Monitoring", keterangan: "" },
    { strat_no: 2, pk_no: 2, seq: 2, name: "[GRAHA II] - Sapphire Riverside", keterangan: "" },
    { strat_no: 2, pk_no: 2, seq: 3, name: "[GRAHA II] Murah (WAJIB DIGAS)", keterangan: "" },
    { strat_no: 2, pk_no: 2, seq: 4, name: "[GRAHA II] - Sapphire Madani", keterangan: "" },
    { strat_no: 2, pk_no: 2, seq: 5, name: "[GRAHA II] Jalan campaign retargeting", keterangan: "" },
    { strat_no: 2, pk_no: 3, seq: 1, name: "[GRAHA II] Paid Promote Media Lokal", keterangan: "" },
    { strat_no: 2, pk_no: 3, seq: 2, name: "[GRAHA II] - Info Purwokerto", keterangan: "" },
    { strat_no: 2, pk_no: 3, seq: 3, name: "[GRAHA II] - Purwokerto City", keterangan: "" },
    { strat_no: 2, pk_no: 3, seq: 4, name: "[GRAHA II] Collab Post", keterangan: "" },
    { strat_no: 2, pk_no: 3, seq: 5, name: "[GRAHA II] - Institusi (DLH)", keterangan: "" },
    { strat_no: 2, pk_no: 3, seq: 6, name: "[GRAHA II] - Brand (Tala, Dr Yuskin, Pintu Berdikari)", keterangan: "" },
    { strat_no: 2, pk_no: 4, seq: 1, name: "[GRAHA II] Kelola data customer dengan membuat Channel", keterangan: "" },
    { strat_no: 2, pk_no: 4, seq: 2, name: "[GRAHA II] - Kelola data CS Mol (Cold Warm Hot)", keterangan: "" },
    { strat_no: 2, pk_no: 4, seq: 3, name: "[GRAHA II] - Kelola WA Channel", keterangan: "" },
    { strat_no: 2, pk_no: 4, seq: 4, name: "[GRAHA II] - Kelola IG Channel", keterangan: "" },
    { strat_no: 2, pk_no: 4, seq: 5, name: "[GRAHA II] Survei Kepuasan Konsumen Booking", keterangan: "" },
    { strat_no: 2, pk_no: 4, seq: 6, name: "[GRAHA II] Survei Kepuasan Konsumen BAST", keterangan: "" },
    { strat_no: 2, pk_no: 4, seq: 7, name: "[GRAHA II] Program Birthday/touch point untuk konsumen vip existing", keterangan: "" },
    { strat_no: 2, pk_no: 1, seq: 5, name: "[GRAHA II] Pemasangan Totem/SignAge Digital di area lobby/resto dan promosi di TV Promosional Channel", keterangan: "" },
    { strat_no: 2, pk_no: 2, seq: 6, name: "[GRAHA II] Pasang Iklan Di Bioskop", keterangan: "" },
    { strat_no: 2, pk_no: 3, seq: 7, name: "[GRAHA II] Promosi Visual di Area Indoor dan Outdoor", keterangan: "" },
    { strat_no: 2, pk_no: 4, seq: 8, name: "[GRAHA II] Pemasangan Totem/SignAge Digital di area lobby/resto dan promosi di In-Room Promosional Channel", keterangan: "" },
    { strat_no: 2, pk_no: 5, seq: 1, name: "[GRAHA II] Pemasangan Totem/SignAge Digital di area lobby/resto dan promosi di In-Room Promosional Channel", keterangan: "" },
    { strat_no: 2, pk_no: 6, seq: 1, name: "[GRAHA II] Pemasangan Totem/SignAge Digital di area lobby/resto dan promosi di In-Room Promosional Channel", keterangan: "" },
    { strat_no: 2, pk_no: 7, seq: 1, name: "[GRAHA II] Pemasangan Totem/SignAge Digital di area lobby/resto dan promosi di In-Room Promosional Channel", keterangan: "" },
    { strat_no: 2, pk_no: 8, seq: 1, name: "[GRAHA II] Pemasangkan Totem/SignAge DIgital", keterangan: "" },
    { strat_no: 2, pk_no: 9, seq: 1, name: "[GRAHA II] Pemasangkan Totem/SignAge DIgital", keterangan: "" },
    { strat_no: 2, pk_no: 10, seq: 1, name: "[GRAHA II] Pemasangkan Totem/SignAge DIgital", keterangan: "" },
    { strat_no: 2, pk_no: 11, seq: 1, name: "[GRAHA II] Pemasangkan Totem/SignAge DIgital", keterangan: "" },
    { strat_no: 2, pk_no: 12, seq: 1, name: "[GRAHA II] Pemasangkan Totem/SignAge DIgital", keterangan: "" },
    { strat_no: 2, pk_no: 13, seq: 1, name: "[GRAHA II] Pemasangkan Totem/SignAge DIgital", keterangan: "" },
    { strat_no: 2, pk_no: 14, seq: 1, name: "[GRAHA II] Pemasangkan Totem/SignAge DIgital", keterangan: "" },
    { strat_no: 4, pk_no: 1, seq: 1, name: "[GRAHA II] Hari Konsumen, Hari Kartini, Hari Bumi", keterangan: "" },
    { strat_no: 4, pk_no: 2, seq: 1, name: "[GRAHA II] Open House", keterangan: "" },
  ];
  const grahaiiiData: Array<{ strat_no: number; pk_no: number; seq: number; name: string; keterangan: string }> = [
    { strat_no: 1, pk_no: 1, seq: 1, name: "[GRAHA III] Sapphire Residence Sumbang - Sapphire Residence Sumbang (depan proyek)", keterangan: "" },
    { strat_no: 1, pk_no: 1, seq: 2, name: "[GRAHA III] Desain Visual", keterangan: "" },
    { strat_no: 1, pk_no: 1, seq: 3, name: "[GRAHA III] Cetak Visual", keterangan: "" },
    { strat_no: 1, pk_no: 1, seq: 4, name: "[GRAHA III] Pemasangan", keterangan: "" },
    { strat_no: 1, pk_no: 1, seq: 5, name: "[GRAHA III] Sapphire Town House Purbalingga - Bobotsari", keterangan: "" },
    { strat_no: 1, pk_no: 1, seq: 6, name: "[GRAHA III] Desain Visual", keterangan: "" },
    { strat_no: 1, pk_no: 1, seq: 7, name: "[GRAHA III] Cetak Visual", keterangan: "" },
    { strat_no: 1, pk_no: 1, seq: 8, name: "[GRAHA III] Pemasangan", keterangan: "" },
    { strat_no: 1, pk_no: 1, seq: 9, name: "[GRAHA III] Soemarmo Square switch Sapphire Town House Purbalingga", keterangan: "" },
    { strat_no: 1, pk_no: 1, seq: 10, name: "[GRAHA III] Desain Visual", keterangan: "" },
    { strat_no: 1, pk_no: 1, seq: 11, name: "[GRAHA III] Cetak Visual", keterangan: "" },
    { strat_no: 1, pk_no: 1, seq: 12, name: "[GRAHA III] Pemasangan", keterangan: "" },
    { strat_no: 1, pk_no: 1, seq: 13, name: "[GRAHA III] Sapphire Residence Sumbang - Tugu Adipura Berkoh", keterangan: "" },
    { strat_no: 1, pk_no: 1, seq: 14, name: "[GRAHA III] Desain Visual", keterangan: "" },
    { strat_no: 1, pk_no: 1, seq: 15, name: "[GRAHA III] Cetak Visual", keterangan: "" },
    { strat_no: 1, pk_no: 1, seq: 16, name: "[GRAHA III] Pemasangan", keterangan: "" },
    { strat_no: 1, pk_no: 1, seq: 17, name: "[GRAHA III] Sapphire Residence Sumbang - Karangcegak, Sumbang", keterangan: "" },
    { strat_no: 1, pk_no: 1, seq: 18, name: "[GRAHA III] Desain Visual", keterangan: "" },
    { strat_no: 1, pk_no: 1, seq: 19, name: "[GRAHA III] Cetak Visual", keterangan: "" },
    { strat_no: 1, pk_no: 1, seq: 20, name: "[GRAHA III] Pemasangan", keterangan: "" },
    { strat_no: 1, pk_no: 1, seq: 21, name: "[GRAHA III] Sapphire Residence Sumbang - Sapphire Riverside - Sunan Ampel, Kedung Malang", keterangan: "" },
    { strat_no: 1, pk_no: 1, seq: 22, name: "[GRAHA III] Desain Visual", keterangan: "" },
    { strat_no: 1, pk_no: 1, seq: 23, name: "[GRAHA III] Cetak Visual", keterangan: "" },
    { strat_no: 1, pk_no: 1, seq: 24, name: "[GRAHA III] Pemasangan", keterangan: "" },
    { strat_no: 1, pk_no: 2, seq: 1, name: "[GRAHA III] Sapphire Town House Purbalingga - Sapphire Town House Purbalingga", keterangan: "" },
    { strat_no: 1, pk_no: 2, seq: 2, name: "[GRAHA III] Desain Visual", keterangan: "" },
    { strat_no: 1, pk_no: 2, seq: 3, name: "[GRAHA III] Cetak Visual", keterangan: "" },
    { strat_no: 1, pk_no: 2, seq: 4, name: "[GRAHA III] Pemasangan", keterangan: "" },
    { strat_no: 1, pk_no: 2, seq: 5, name: "[GRAHA III] Sapphire Residence Sumbang - Perempatan Padamara", keterangan: "" },
    { strat_no: 1, pk_no: 2, seq: 6, name: "[GRAHA III] Desain Visual", keterangan: "" },
    { strat_no: 1, pk_no: 2, seq: 7, name: "[GRAHA III] Cetak Visual", keterangan: "" },
    { strat_no: 1, pk_no: 2, seq: 8, name: "[GRAHA III] Pemasangan", keterangan: "" },
    { strat_no: 1, pk_no: 2, seq: 9, name: "[GRAHA III] Sapphire Town House Purbalingga - Mayjen Sungkono, Purbalingga", keterangan: "" },
    { strat_no: 1, pk_no: 2, seq: 10, name: "[GRAHA III] Desain Visual", keterangan: "" },
    { strat_no: 1, pk_no: 2, seq: 11, name: "[GRAHA III] Cetak Visual", keterangan: "" },
    { strat_no: 1, pk_no: 2, seq: 12, name: "[GRAHA III] Pemasangan", keterangan: "" },
    { strat_no: 1, pk_no: 3, seq: 1, name: "[GRAHA III] 8 Titik Sapphire Residence Sumbang (Formasi 2:3:3)", keterangan: "deket taman CGR," },
    { strat_no: 1, pk_no: 3, seq: 2, name: "[GRAHA III] Desain Visual", keterangan: "" },
    { strat_no: 1, pk_no: 3, seq: 3, name: "[GRAHA III] Cetak Visual", keterangan: "" },
    { strat_no: 1, pk_no: 3, seq: 4, name: "[GRAHA III] Pemasangan", keterangan: "" },
    { strat_no: 1, pk_no: 3, seq: 5, name: "[GRAHA III] 5 Titik Sapphire TH Purbalingga  (Formasi 1:3:1)", keterangan: "CGR 3 titik di Blok A17; 2 titik di depan; Sisanya kawasan" },
    { strat_no: 1, pk_no: 3, seq: 6, name: "[GRAHA III] Desain Visual", keterangan: "" },
    { strat_no: 1, pk_no: 3, seq: 7, name: "[GRAHA III] Cetak Visual", keterangan: "" },
    { strat_no: 1, pk_no: 3, seq: 8, name: "[GRAHA III] Pemasangan", keterangan: "" },
    { strat_no: 1, pk_no: 4, seq: 1, name: "[GRAHA III] Revisual 5 Titik T Banner di Wilayah TH Purbalingga", keterangan: "PDAM Purbalingga," },
    { strat_no: 1, pk_no: 4, seq: 2, name: "[GRAHA III] Desain Visual", keterangan: "" },
    { strat_no: 1, pk_no: 4, seq: 3, name: "[GRAHA III] Cetak Visual", keterangan: "" },
    { strat_no: 1, pk_no: 4, seq: 4, name: "[GRAHA III] Pemasangan", keterangan: "" },
    { strat_no: 1, pk_no: 4, seq: 5, name: "[GRAHA III] Revisual 10 Titik T Banner di Wilayah Sumbang", keterangan: "10 titik T Banner Dekat Surya Yuda" },
    { strat_no: 1, pk_no: 4, seq: 6, name: "[GRAHA III] Desain Visual", keterangan: "" },
    { strat_no: 1, pk_no: 4, seq: 7, name: "[GRAHA III] Cetak Visual", keterangan: "" },
    { strat_no: 1, pk_no: 4, seq: 8, name: "[GRAHA III] Pemasangan", keterangan: "" },
    { strat_no: 2, pk_no: 1, seq: 1, name: "[GRAHA III] Progress Kawasan Sapphire Town House Purbalingga", keterangan: "" },
    { strat_no: 2, pk_no: 1, seq: 2, name: "[GRAHA III] Storytelling TH Purbalingga", keterangan: "" },
    { strat_no: 2, pk_no: 1, seq: 3, name: "[GRAHA III] Tinggal di Tengah Kota, Tapi Tetap Nyaman? Ini Kuncinya", keterangan: "" },
    { strat_no: 2, pk_no: 2, seq: 1, name: "[GRAHA III] Dioptimasi/REM Budget", keterangan: "" },
    { strat_no: 2, pk_no: 2, seq: 2, name: "[GRAHA III] - Sapphire Residence Sumbang", keterangan: "" },
    { strat_no: 2, pk_no: 2, seq: 3, name: "[GRAHA III] - Sapphire Town House Purbalingga", keterangan: "" },
    { strat_no: 2, pk_no: 2, seq: 4, name: "[GRAHA III] Jalan campaign retargeting", keterangan: "" },
    { strat_no: 2, pk_no: 3, seq: 1, name: "[GRAHA III] Paid Promote Media Lokal", keterangan: "" },
    { strat_no: 2, pk_no: 3, seq: 2, name: "[GRAHA III] - Info Purwokerto", keterangan: "" },
    { strat_no: 2, pk_no: 3, seq: 3, name: "[GRAHA III] - Purwokerto City", keterangan: "" },
    { strat_no: 2, pk_no: 3, seq: 4, name: "[GRAHA III] Collab Post", keterangan: "" },
    { strat_no: 2, pk_no: 3, seq: 5, name: "[GRAHA III] - Institusi (DLH)", keterangan: "" },
    { strat_no: 2, pk_no: 3, seq: 6, name: "[GRAHA III] - Brand (Tala, Dr Yuskin, Pintu Berdikari)", keterangan: "" },
    { strat_no: 2, pk_no: 4, seq: 1, name: "[GRAHA III] Kelola data customer dengan membuat Channel", keterangan: "" },
    { strat_no: 2, pk_no: 4, seq: 2, name: "[GRAHA III] - Kelola data CS Mol (Cold Warm Hot)", keterangan: "" },
    { strat_no: 2, pk_no: 4, seq: 3, name: "[GRAHA III] - Kelola WA Channel", keterangan: "" },
    { strat_no: 2, pk_no: 4, seq: 4, name: "[GRAHA III] - Kelola IG Channel", keterangan: "" },
    { strat_no: 2, pk_no: 5, seq: 1, name: "[GRAHA III] Survei Kepuasan Konsumen Booking", keterangan: "" },
    { strat_no: 2, pk_no: 6, seq: 1, name: "[GRAHA III] Survei Kepuasan Konsumen BAST", keterangan: "" },
    { strat_no: 2, pk_no: 7, seq: 1, name: "[GRAHA III] Program Birthday/touch point untuk konsumen vip existing", keterangan: "" },
    { strat_no: 3, pk_no: 1, seq: 1, name: "[GRAHA III] Pemasangan Totem/SignAge Digital di area lobby/resto dan promosi di In-Room Promosional Channel", keterangan: "Surat Penawaran kerjasama" },
    { strat_no: 3, pk_no: 2, seq: 1, name: "[GRAHA III] Pemasangkan Totem/SignAge DIgital", keterangan: "Surat Penawaran kerjasama" },
    { strat_no: 3, pk_no: 3, seq: 1, name: "[GRAHA III] Pemasangkan Totem/SignAge DIgital", keterangan: "Surat Penawaran kerjasama" },
    { strat_no: 3, pk_no: 4, seq: 1, name: "[GRAHA III] Pemasangkan Totem/SignAge DIgital", keterangan: "Surat Penawaran kerjasama" },
    { strat_no: 3, pk_no: 5, seq: 1, name: "[GRAHA III] Pemasangkan Totem/SignAge DIgital", keterangan: "Surat Penawaran kerjasama" },
    { strat_no: 3, pk_no: 6, seq: 1, name: "[GRAHA III] Pemasangkan Totem/SignAge DIgital", keterangan: "Surat Penawaran kerjasama" },
    { strat_no: 3, pk_no: 7, seq: 1, name: "[GRAHA III] Pemasangkan Totem/SignAge DIgital", keterangan: "Surat Penawaran kerjasama" },
    { strat_no: 3, pk_no: 8, seq: 1, name: "[GRAHA III] Pemasangkan Totem/SignAge DIgital", keterangan: "Surat Penawaran kerjasama" },
    { strat_no: 3, pk_no: 6, seq: 2, name: "[GRAHA III] Pemasangkan Totem/SignAge DIgital", keterangan: "Surat Penawaran kerjasama" },
    { strat_no: 3, pk_no: 9, seq: 1, name: "[GRAHA III] Pemasangkan Totem/SignAge DIgital", keterangan: "Surat Penawaran kerjasama" },
    { strat_no: 3, pk_no: 9, seq: 2, name: "[GRAHA III] NaT", keterangan: "NaT" },
    { strat_no: 3, pk_no: 9, seq: 3, name: "[GRAHA III] NaT", keterangan: "NaT" },
    { strat_no: 3, pk_no: 9, seq: 4, name: "[GRAHA III] NaT", keterangan: "NaT" },
    { strat_no: 3, pk_no: 9, seq: 5, name: "[GRAHA III] NaT", keterangan: "NaT" },
    { strat_no: 4, pk_no: 1, seq: 1, name: "[GRAHA III] Hari Konsumen, Hari Kartini, Hari Bumi", keterangan: "" },
    { strat_no: 4, pk_no: 2, seq: 1, name: "[GRAHA III] Open House", keterangan: "" },
    { strat_no: 5, pk_no: 5, seq: 1, name: "[GRAHA III] NaT", keterangan: "NaT" },
    { strat_no: 5, pk_no: 5, seq: 2, name: "[GRAHA III] NaT", keterangan: "NaT" },
    { strat_no: 5, pk_no: 5, seq: 3, name: "[GRAHA III] NaT", keterangan: "NaT" },
  ];
  const grahaivData: Array<{ strat_no: number; pk_no: number; seq: number; name: string; keterangan: string }> = [
    { strat_no: 1, pk_no: 1, seq: 1, name: "[GRAHA IV] Samara Pegalongan - Samara Wiradadi - Sultan Agung (Ex Griya Satria) (Dibeli)", keterangan: "" },
    { strat_no: 1, pk_no: 1, seq: 2, name: "[GRAHA IV] Desain Visual", keterangan: "" },
    { strat_no: 1, pk_no: 1, seq: 3, name: "[GRAHA IV] Cetak Visual", keterangan: "" },
    { strat_no: 1, pk_no: 1, seq: 4, name: "[GRAHA IV] Pemasangan", keterangan: "" },
    { strat_no: 1, pk_no: 1, seq: 5, name: "[GRAHA IV] Samara Pegalongan - Sapphire Serenity - Lampu Merah Pegalongan (Jl. Kaliori - Patikraja)", keterangan: "" },
    { strat_no: 1, pk_no: 1, seq: 6, name: "[GRAHA IV] Desain Visual", keterangan: "" },
    { strat_no: 1, pk_no: 1, seq: 7, name: "[GRAHA IV] Cetak Visual", keterangan: "" },
    { strat_no: 1, pk_no: 1, seq: 8, name: "[GRAHA IV] Pemasangan", keterangan: "" },
    { strat_no: 1, pk_no: 1, seq: 9, name: "[GRAHA IV] Sapphire Serenity - Mitra 10 Jl Suparjo Rustam", keterangan: "" },
    { strat_no: 1, pk_no: 1, seq: 10, name: "[GRAHA IV] Desain Visual", keterangan: "" },
    { strat_no: 1, pk_no: 1, seq: 11, name: "[GRAHA IV] Cetak Visual", keterangan: "" },
    { strat_no: 1, pk_no: 1, seq: 12, name: "[GRAHA IV] Pemasangan", keterangan: "" },
    { strat_no: 1, pk_no: 1, seq: 13, name: "[GRAHA IV] Samara Wiradadi - SPBU Karang Nanas", keterangan: "" },
    { strat_no: 1, pk_no: 1, seq: 14, name: "[GRAHA IV] Desain Visual", keterangan: "" },
    { strat_no: 1, pk_no: 1, seq: 15, name: "[GRAHA IV] Cetak Visual", keterangan: "" },
    { strat_no: 1, pk_no: 1, seq: 16, name: "[GRAHA IV] Pemasangan", keterangan: "" },
    { strat_no: 1, pk_no: 1, seq: 17, name: "[GRAHA IV] Samara Pegalongan - Samara Pegalongan", keterangan: "" },
    { strat_no: 1, pk_no: 1, seq: 18, name: "[GRAHA IV] Desain Visual", keterangan: "" },
    { strat_no: 1, pk_no: 1, seq: 19, name: "[GRAHA IV] Cetak Visual", keterangan: "" },
    { strat_no: 1, pk_no: 1, seq: 20, name: "[GRAHA IV] Pemasangan", keterangan: "" },
    { strat_no: 1, pk_no: 2, seq: 1, name: "[GRAHA IV] Samara Pegalongan - Gunung Tugel (TPA)", keterangan: "" },
    { strat_no: 1, pk_no: 2, seq: 2, name: "[GRAHA IV] Desain Visual", keterangan: "" },
    { strat_no: 1, pk_no: 2, seq: 3, name: "[GRAHA IV] Cetak Visual", keterangan: "" },
    { strat_no: 1, pk_no: 2, seq: 4, name: "[GRAHA IV] Pemasangan", keterangan: "" },
    { strat_no: 1, pk_no: 2, seq: 5, name: "[GRAHA IV] Samara Asri Wiradadi - SD Wiradadi", keterangan: "" },
    { strat_no: 1, pk_no: 2, seq: 6, name: "[GRAHA IV] Desain Visual", keterangan: "" },
    { strat_no: 1, pk_no: 2, seq: 7, name: "[GRAHA IV] Cetak Visual", keterangan: "" },
    { strat_no: 1, pk_no: 2, seq: 8, name: "[GRAHA IV] Pemasangan", keterangan: "" },
    { strat_no: 1, pk_no: 2, seq: 9, name: "[GRAHA IV] Samara Asri Wiradadi - Jl Protokol Wiradadi", keterangan: "" },
    { strat_no: 1, pk_no: 2, seq: 10, name: "[GRAHA IV] Desain Visual", keterangan: "" },
    { strat_no: 1, pk_no: 2, seq: 11, name: "[GRAHA IV] Cetak Visual", keterangan: "" },
    { strat_no: 1, pk_no: 2, seq: 12, name: "[GRAHA IV] Pemasangan", keterangan: "" },
    { strat_no: 1, pk_no: 2, seq: 13, name: "[GRAHA IV] Riverside - Sapphire Serenity - Aston arah Unsoed", keterangan: "" },
    { strat_no: 1, pk_no: 2, seq: 14, name: "[GRAHA IV] Desain Visual", keterangan: "" },
    { strat_no: 1, pk_no: 2, seq: 15, name: "[GRAHA IV] Cetak Visual", keterangan: "" },
    { strat_no: 1, pk_no: 2, seq: 16, name: "[GRAHA IV] Pemasangan", keterangan: "" },
    { strat_no: 1, pk_no: 2, seq: 17, name: "[GRAHA IV] Sapphire Serenity - Tanjung", keterangan: "" },
    { strat_no: 1, pk_no: 2, seq: 18, name: "[GRAHA IV] Desain Visual", keterangan: "" },
    { strat_no: 1, pk_no: 2, seq: 19, name: "[GRAHA IV] Cetak Visual", keterangan: "" },
    { strat_no: 1, pk_no: 2, seq: 20, name: "[GRAHA IV] Pemasangan", keterangan: "" },
    { strat_no: 2, pk_no: 1, seq: 1, name: "[GRAHA IV] Progress  Kawasan Sapphire Serenity", keterangan: "" },
    { strat_no: 2, pk_no: 1, seq: 2, name: "[GRAHA IV] Progress Wiradadi Hari Ini: Sudah Sejauh Ini", keterangan: "" },
    { strat_no: 2, pk_no: 1, seq: 3, name: "[GRAHA IV] Indekos vs Kontrakan vs Cicil Rumah", keterangan: "" },
    { strat_no: 2, pk_no: 1, seq: 4, name: "[GRAHA IV] Kenapa Rumah Bisa Terasa Nyaman, Meski Ukurannya Nggak Besar?", keterangan: "" },
    { strat_no: 2, pk_no: 2, seq: 1, name: "[GRAHA IV] Dioptimasi/REM Budget", keterangan: "" },
    { strat_no: 2, pk_no: 2, seq: 2, name: "[GRAHA IV] Sapphire Residence Sumbang", keterangan: "" },
    { strat_no: 2, pk_no: 2, seq: 3, name: "[GRAHA IV] Sapphire Town House Purbalingga", keterangan: "" },
    { strat_no: 2, pk_no: 2, seq: 4, name: "[GRAHA IV] Jalan campaign retargeting", keterangan: "" },
    { strat_no: 2, pk_no: 3, seq: 1, name: "[GRAHA IV] Paid Promote Media Lokal", keterangan: "" },
    { strat_no: 2, pk_no: 3, seq: 2, name: "[GRAHA IV] - Info Purwokerto", keterangan: "" },
    { strat_no: 2, pk_no: 3, seq: 3, name: "[GRAHA IV] - Purwokerto City", keterangan: "" },
    { strat_no: 2, pk_no: 3, seq: 4, name: "[GRAHA IV] Collab Post", keterangan: "" },
    { strat_no: 2, pk_no: 3, seq: 5, name: "[GRAHA IV] - Institusi (DLH)", keterangan: "" },
    { strat_no: 2, pk_no: 3, seq: 6, name: "[GRAHA IV] - Brand (Tala, Dr Yuskin, Pintu Berdikari)", keterangan: "" },
    { strat_no: 2, pk_no: 4, seq: 1, name: "[GRAHA IV] Kelola data customer dengan membuat Channel", keterangan: "" },
    { strat_no: 2, pk_no: 4, seq: 2, name: "[GRAHA IV] - Kelola data CS Mol (Cold Warm Hot)", keterangan: "" },
    { strat_no: 2, pk_no: 4, seq: 3, name: "[GRAHA IV] - Kelola WA Channel", keterangan: "" },
    { strat_no: 2, pk_no: 4, seq: 4, name: "[GRAHA IV] - Kelola IG Channel", keterangan: "" },
    { strat_no: 2, pk_no: 4, seq: 5, name: "[GRAHA IV] Survei Kepuasan Konsumen Booking", keterangan: "" },
    { strat_no: 2, pk_no: 4, seq: 6, name: "[GRAHA IV] Survei Kepuasan Konsumen BAST", keterangan: "" },
    { strat_no: 2, pk_no: 4, seq: 7, name: "[GRAHA IV] Program Birthday/touch point untuk konsumen vip existing", keterangan: "" },
    { strat_no: 3, pk_no: 1, seq: 1, name: "[GRAHA IV] Pemasangan Totem/SignAge Digital di area lobby/resto dan promosi di In-Room Promosional Channel", keterangan: "" },
    { strat_no: 3, pk_no: 2, seq: 1, name: "[GRAHA IV] Pemasangan Totem/SignAge Digital di area lobby/resto dan promosi di In-Room Promosional Channel", keterangan: "" },
    { strat_no: 3, pk_no: 3, seq: 1, name: "[GRAHA IV] Pemasangan Totem/SignAge Digital di area lobby/resto dan promosi di In-Room Promosional Channel", keterangan: "Kerjasama program KPR Promo untuk staf dan dokter" },
    { strat_no: 3, pk_no: 4, seq: 1, name: "[GRAHA IV] Pemasangan Totem/SignAge Digital di area lobby/resto dan promosi di In-Room Promosional Channel", keterangan: "" },
    { strat_no: 3, pk_no: 5, seq: 1, name: "[GRAHA IV] Pemasangan Totem/SignAge Digital di area lobby/resto dan promosi di TV Promosional Channel", keterangan: "" },
    { strat_no: 3, pk_no: 6, seq: 1, name: "[GRAHA IV] Pemasangkan Totem/SignAge DIgital", keterangan: "" },
    { strat_no: 3, pk_no: 7, seq: 1, name: "[GRAHA IV] Pemasangkan Totem/SignAge DIgital", keterangan: "" },
    { strat_no: 3, pk_no: 8, seq: 1, name: "[GRAHA IV] Pemasangkan Totem/SignAge DIgital", keterangan: "" },
    { strat_no: 3, pk_no: 9, seq: 1, name: "[GRAHA IV] Pemasangkan Totem/SignAge DIgital", keterangan: "" },
    { strat_no: 3, pk_no: 10, seq: 1, name: "[GRAHA IV] Pemasangkan Totem/SignAge DIgital", keterangan: "" },
    { strat_no: 3, pk_no: 11, seq: 1, name: "[GRAHA IV] Pemasangkan Totem/SignAge DIgital", keterangan: "" },
    { strat_no: 3, pk_no: 12, seq: 1, name: "[GRAHA IV] Pemasangkan Totem/SignAge DIgital", keterangan: "Kerjasama pemasangan banner sapphire grup di area lapangan" },
    { strat_no: 3, pk_no: 13, seq: 1, name: "[GRAHA IV] Pemasangkan Totem/SignAge DIgital", keterangan: "Kerjasama sewa titik lokasi banner sapphire grup" },
    { strat_no: 3, pk_no: 14, seq: 1, name: "[GRAHA IV] Pemasangkan Totem/SignAge DIgital", keterangan: "" },
    { strat_no: 4, pk_no: 1, seq: 1, name: "[GRAHA IV] Hari Konsumen, Hari Kartini, Hari Bumi", keterangan: "" },
    { strat_no: 4, pk_no: 2, seq: 1, name: "[GRAHA IV] Open House", keterangan: "" },
    { strat_no: 4, pk_no: 3, seq: 1, name: "[GRAHA IV] Fun Run Town House Purbalingga", keterangan: "" },
  ];

  // 4. Create cluster projects
  console.log("\n── Membuat cluster projects...");
  const clusterDefs = [
    { label: "All Project",    cluster: "All Project" },
    { label: "Bisnis Graha I",   cluster: "Bisnis Graha I" },
    { label: "Bisnis Graha II",  cluster: "Bisnis Graha II" },
    { label: "Bisnis Graha III", cluster: "Bisnis Graha III" },
    { label: "Bisnis Graha IV",  cluster: "Bisnis Graha IV" },
  ];
  const clusterProjects: Record<string, { id: string; name: string }> = {};
  for (const def of clusterDefs) {
    const proj = await prisma.project.upsert({
      where: { name: def.label },
      update: {},
      create: { name: def.label, cluster: def.cluster, clusterType: "GRAHA" },
    });
    clusterProjects[def.label] = proj;
    console.log(`   ✓ Project: ${proj.name}`);
  }

  // Link Goffar to each cluster project (so dashboard filter includes cluster strategies)
  for (const proj of Object.values(clusterProjects)) {
    await prisma.userProject.upsert({
      where: { userId_projectId: { userId: goffar.id, projectId: proj.id } },
      update: {},
      create: { userId: goffar.id, projectId: proj.id },
    });
  }
  console.log(`   ✓ UserProject Goffar: ${Object.keys(clusterProjects).length} cluster projects`);

  // Base strategies (numbers 1-4) = AllProject
  const baseStrategies = strategies.filter((s) => s.number <= 4);

  // 5. Seed AllProject strategies — only AllProject APs, link to "All Project" project
  console.log("\n── Seeding AllProject...");
  for (const strategy of baseStrategies) {
    await prisma.strategy.update({
      where: { id: strategy.id },
      data: { projectId: clusterProjects["All Project"].id },
    });

    const pkDataMap = allProjectData[strategy.number];
    if (!pkDataMap) continue;

    for (const pk of strategy.programKerja) {
      const pkData = pkDataMap[pk.number];
      if (!pkData) continue;

      await prisma.actionPlan.deleteMany({ where: { programKerjaId: pk.id } });
      const apsToCreate = pkData.aps.map((ap) => ({
        programKerjaId: pk.id,
        number: ap.number,
        name: ap.name,
      }));
      if (apsToCreate.length > 0)
        await prisma.actionPlan.createMany({ data: apsToCreate, skipDuplicates: true });
      console.log(`   ✓ S${strategy.number}.PK${pk.number}: ${apsToCreate.length} APs`);
    }
  }

  // 6. Seed per-cluster Graha strategies
  const grahaClusters = [
    { label: "Bisnis Graha I",   data: grahaiData,   numOffset: 4  },
    { label: "Bisnis Graha II",  data: grahaiiData,  numOffset: 8  },
    { label: "Bisnis Graha III", data: grahaiiiData, numOffset: 12 },
    { label: "Bisnis Graha IV",  data: grahaivData,  numOffset: 16 },
  ];

  for (const cluster of grahaClusters) {
    console.log(`\n── Seeding ${cluster.label}...`);
    const clusterProject = clusterProjects[cluster.label];

    for (const baseStrat of baseStrategies) {
      const stratNumber = baseStrat.number + cluster.numOffset;

      const strategy = await prisma.strategy.upsert({
        where: {
          divisionId_periodId_number: {
            divisionId: division.id,
            periodId: baseStrat.periodId,
            number: stratNumber,
          },
        },
        update: { projectId: clusterProject.id, name: baseStrat.name },
        create: {
          divisionId: division.id,
          periodId: baseStrat.periodId,
          number: stratNumber,
          name: baseStrat.name,
          projectId: clusterProject.id,
        },
      });

      const pkDataMap = allProjectData[baseStrat.number];
      if (!pkDataMap) continue;

      for (const [pkNoStr, pkData] of Object.entries(pkDataMap)) {
        const pkNo = parseInt(pkNoStr);
        const clusterAPs = cluster.data.filter(
          (d) => d.strat_no === baseStrat.number && d.pk_no === pkNo
        );
        if (clusterAPs.length === 0) continue;

        const pk = await prisma.programKerja.upsert({
          where: { strategyId_number: { strategyId: strategy.id, number: pkNo } },
          update: { name: pkData.pkName },
          create: { strategyId: strategy.id, number: pkNo, name: pkData.pkName },
        });

        await prisma.actionPlan.deleteMany({ where: { programKerjaId: pk.id } });
        const apsToCreate = clusterAPs.map((ap) => ({
          programKerjaId: pk.id,
          number: ap.seq,
          name: ap.name,
        }));
        await prisma.actionPlan.createMany({ data: apsToCreate, skipDuplicates: true });
        console.log(`   ✓ S${stratNumber}.PK${pkNo}: ${apsToCreate.length} APs`);
      }
    }
  }

  // 7. Summary
  const totalAP = await prisma.actionPlan.count({
    where: { programKerja: { strategy: { divisionId: division.id } } },
  });
  console.log(`\n✅ Seeding selesai! Total AP Bisnis Graha: ${totalAP}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());