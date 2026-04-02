import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Inlinekan LICENSE_KEY saat build agar tersedia di Edge Runtime middleware.
  // Pastikan .env sudah berisi LICENSE_KEY sebelum menjalankan `next build`.
  env: {
    LICENSE_KEY: process.env.LICENSE_KEY ?? "",
  },
};

export default nextConfig;
