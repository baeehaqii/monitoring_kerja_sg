import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Monitoring Program Sapphire Grup",
  description: "Monitoring Program Kerja Sapphire Grup by Siproper",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`h-full ${plusJakartaSans.variable}`}>
      <body className="min-h-full font-[family-name:var(--font-jakarta)]">{children}</body>
    </html>
  );
}
