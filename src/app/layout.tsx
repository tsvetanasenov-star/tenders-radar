import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tenders Radar — Мониторинг на обществени поръчки",
  description: "B2B платформа за мониторинг и AI анализ на обществени поръчки за малки и средни фирми в България.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bg" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
