"use client";

import { AlertTriangle, ArrowRight, QrCode } from "lucide-react";

interface QrScannerCardProps {
  chargerIdInput: string;
  error: string;
  onInputChange: (value: string) => void;
  onSubmit: () => void;
}

export function QrScannerCard({
  chargerIdInput,
  error,
  onInputChange,
  onSubmit,
}: QrScannerCardProps) {
  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <div className="w-full glass-panel rounded-2xl p-6 border border-zinc-800/80 mb-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl" />

      <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
        <div className="flex justify-center mb-4">
          <div className="relative p-6 rounded-2xl bg-zinc-950/80 border border-zinc-800 flex items-center justify-center glow-active-cyan">
            <QrCode size={48} className="text-cyan-400" />
            <div className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500" />
            </div>
          </div>
        </div>

        <div className="text-center mb-2">
          <span className="text-xs text-zinc-400 uppercase tracking-widest font-semibold">
            ระบุรหัสเครื่องชาร์จ
          </span>
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="ตัวอย่าง: EV-BKK-001"
            value={chargerIdInput}
            onChange={(e) => onInputChange(e.target.value)}
            className="w-full text-center font-mono text-lg uppercase tracking-wider py-3 px-4 rounded-xl bg-zinc-950 border border-zinc-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none text-slate-100 transition-all placeholder:text-zinc-600"
          />
        </div>

        {error && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
            <AlertTriangle size={14} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 font-bold text-black flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-cyan-500/10 hover:shadow-cyan-500/20 active:scale-[0.98]"
        >
          <span>ดำเนินการต่อ</span>
          <ArrowRight size={16} />
        </button>
      </form>
    </div>
  );
}
