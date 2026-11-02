import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "VOLTCHARGE - ระบบชำระเงินและสั่งชาร์จรถยนต์ไฟฟ้า EV ผ่านมือถือ",
  description:
    "บริการชาร์จรถยนต์ไฟฟ้าอัจฉริยะ สแกนคิวอาร์โค้ด ชำระเงินผ่าน PromptPay และเริ่มชาร์จได้ทันที สะดวกรวดเร็ว ปลอดภัย",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
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
        <header className="w-full border-b border-zinc-800/60 bg-zinc-950/40 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 font-bold text-xl tracking-wider text-cyan-400"
            >
              <span className="bg-cyan-500/10 p-1.5 rounded-lg border border-cyan-500/30">
                ⚡
              </span>
              VOLT<span className="text-slate-100 font-light">CHARGE</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/admin"
                className="text-xs font-semibold text-zinc-400 hover:text-cyan-400 transition-colors border border-zinc-800 rounded-full px-3 py-1 bg-zinc-900/50"
              >
                Dashboard ผู้บริหาร
              </Link>
            </div>
          </div>
        </header>

        <main className="flex-1 flex flex-col justify-start">{children}</main>

        <footer className="w-full py-6 text-center border-t border-zinc-900 bg-zinc-950/20 text-xs text-zinc-500">
          <p>
            © {new Date().getFullYear()} VOLTCHARGE Network. All rights
            reserved.
          </p>
        </footer>
      </body>
    </html>
  );
}
