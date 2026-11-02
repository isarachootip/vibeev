"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MessageSquareWarning, ShieldAlert, UserCheck } from "lucide-react";
import { useLiffProfile } from "@/hooks/use-liff-profile";

export function MobileAppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { profile, cycleProfile } = useLiffProfile();

  return (
    <div className="min-h-full flex flex-col pb-16 md:pb-0">
      <header className="w-full border-b border-zinc-800/60 bg-zinc-950/70 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-2">
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-lg sm:text-xl tracking-wider text-cyan-400 shrink-0"
          >
            <span className="bg-cyan-500/10 p-1.5 rounded-lg border border-cyan-500/30">
              ⚡
            </span>
            <div>
              VOLT<span className="text-slate-100 font-light">CHARGE</span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                LINE LIFF + PWA
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={cycleProfile}
              title="คลิกเพื่อสลับบัญชี LINE ทดสอบ"
              className="flex items-center gap-1.5 text-2xs font-medium text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-full px-2.5 py-1 transition-all cursor-pointer"
            >
              <UserCheck size={12} />
              <span className="max-w-[120px] sm:max-w-none truncate">
                {profile.displayName}
              </span>
            </button>

            <Link
              href="/support"
              className="hidden md:flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors border border-emerald-500/30 rounded-full px-3 py-1 bg-emerald-950/30"
            >
              <MessageSquareWarning size={13} />
              <span>แจ้งปัญหา LINE</span>
            </Link>

            <Link
              href="/admin"
              className="hidden md:inline-block text-xs font-semibold text-zinc-400 hover:text-cyan-400 transition-colors border border-zinc-800 rounded-full px-3 py-1 bg-zinc-900/50"
            >
              Dashboard ผู้บริหาร
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col justify-start">{children}</main>

      <footer className="w-full py-6 text-center border-t border-zinc-900 bg-zinc-950/20 text-xs text-zinc-500">
        <p>
          © {new Date().getFullYear()} VOLTCHARGE Network • Connected with LINE
          Official Account Service
        </p>
      </footer>

      {/* Mobile Bottom App Navigation Bar (PWA / LINE LIFF Super-App experience) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 h-16 bg-[#07080e]/95 backdrop-blur-lg border-t border-zinc-800/80 grid grid-cols-3">
        <Link
          href="/"
          className={`flex flex-col items-center justify-center gap-1 text-2xs font-semibold transition-colors ${
            pathname === "/" || pathname.startsWith("/charger")
              ? "text-cyan-400"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <Home size={18} />
          <span>สแกนชาร์จ</span>
        </Link>

        <Link
          href="/support"
          className={`flex flex-col items-center justify-center gap-1 text-2xs font-semibold transition-colors ${
            pathname.startsWith("/support")
              ? "text-emerald-400"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <MessageSquareWarning size={18} />
          <span>แจ้งปัญหา LINE</span>
        </Link>

        <Link
          href="/admin"
          className={`flex flex-col items-center justify-center gap-1 text-2xs font-semibold transition-colors ${
            pathname.startsWith("/admin")
              ? "text-cyan-400"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <ShieldAlert size={18} />
          <span>ผู้บริหาร</span>
        </Link>
      </nav>
    </div>
  );
}
