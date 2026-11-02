"use client";

import { Shield, Zap } from "lucide-react";
import { useStations } from "@/hooks/use-stations";
import { QrScannerCard } from "@/components/home/qr-scanner-card";
import { StationDirectoryList } from "@/components/home/station-directory-list";

export default function HomePage() {
  const {
    stations,
    chargerIdInput,
    isLoading,
    error,
    fetchStations,
    handleInputChange,
    submitChargerCode,
    navigateToStation,
  } = useStations();

  return (
    <div className="flex-1 flex flex-col justify-start items-center px-4 py-8 max-w-md mx-auto w-full">
      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold mb-6">
        <Zap size={12} className="animate-pulse" />
        <span>ระบบชาร์จรถไฟฟ้าอัจฉริยะ 100% Mobile Web</span>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight mb-2 bg-gradient-to-r from-slate-100 via-slate-200 to-cyan-400 bg-clip-text text-transparent">
          สแกน จ่าย เริ่มชาร์จ
        </h1>
        <p className="text-sm text-zinc-400">
          สแกน QR Code ที่ตู้ชาร์จ หรือกรอกรหัสเพื่อใช้บริการได้ทันที
        </p>
      </div>

      <QrScannerCard
        chargerIdInput={chargerIdInput}
        error={error}
        onInputChange={handleInputChange}
        onSubmit={submitChargerCode}
      />

      <div className="w-full flex justify-between gap-4 px-2 py-3 rounded-xl bg-zinc-950/40 border border-zinc-900 mb-8">
        <div className="flex items-center gap-2 text-zinc-400">
          <Shield size={14} className="text-cyan-400" />
          <span className="text-2xs font-medium">เข้ารหัสความปลอดภัย SSL</span>
        </div>
        <div className="flex items-center gap-2 text-zinc-400">
          <Zap size={14} className="text-cyan-400" />
          <span className="text-2xs font-medium">
            เชื่อมโยง API สถานีชาร์จตรง
          </span>
        </div>
      </div>

      <StationDirectoryList
        stations={stations}
        isLoading={isLoading}
        onRefresh={fetchStations}
        onSelectStation={navigateToStation}
      />
    </div>
  );
}
