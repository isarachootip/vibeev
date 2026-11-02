import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { MobileAppShell } from "@/components/layout/mobile-app-shell";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VOLTCHARGE - แอปชาร์จรถยนต์ไฟฟ้าอัจฉริยะ & บริการแจ้งปัญหาผ่าน LINE",
  description:
    "บริการชาร์จรถยนต์ไฟฟ้าอัจฉริยะผ่าน LINE LIFF & PWA ชำระเงิน PromptPay และแจ้งปัญหาผ่าน LINE Official Account",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#07080e",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="th"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#07080e] text-slate-100 selection:bg-cyan-500 selection:text-black">
        <MobileAppShell>{children}</MobileAppShell>
      </body>
    </html>
  );
}
