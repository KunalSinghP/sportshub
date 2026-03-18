import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SportsHub",
  description: "Live Sports Community & AI Analytics",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-[#0b0f19] text-slate-100 antialiased`}>
        <Navbar />
        <main className="pb-20 md:pb-0">{children}</main>
      </body>
    </html>
  );
}
