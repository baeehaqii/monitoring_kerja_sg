---
name: monitoring_kerja_sg
description: Next.js project for monitoring kerja SG with Prisma ORM and PostgreSQL
---

# monitoring_kerja_sg

## Stack
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS 4
- Prisma ORM
- PostgreSQL

## When to use
Aktifkan skill ini saat bekerja di project monitoring_kerja_sg untuk memastikan konvensi kode konsisten.

## Instructions

1. Gunakan App Router, bukan Pages Router
2. Server Components by default, tambah "use client" hanya jika perlu
3. Prisma query selalu lewat server-side (Server Actions atau API Route)
4. Hindari N+1 — gunakan `include` atau `select` di Prisma
5. Komponen UI pakai Tailwind CSS 4, tidak ada inline style
6. Penamaan file: kebab-case untuk file, PascalCase untuk komponen
7. Semua environment variable lewat `.env`, tidak di-hardcode
8. Design card konsisten dan modern
9. component card dan component lainnya selalu modern
10. gunakan https://ui.shadcn.com/docs/components untuk component UI