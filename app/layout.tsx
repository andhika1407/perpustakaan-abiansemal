import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Atkinson_Hyperlegible } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const atkinsonHyperlegible = Atkinson_Hyperlegible({
  variable: "--font-atkinson-hyperlegible",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Perpustakaan SD Negeri 4 Abiansemal",
  description: "Sistem Informasi Perpustakaan SD Negeri 4 Abiansemal",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="id"
      className={`${plusJakartaSans.variable} ${atkinsonHyperlegible.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-body bg-slate-50 text-slate-900">{children}</body>
    </html>
  );
}
