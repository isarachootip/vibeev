"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { QrCode, Zap, MapPin, ArrowRight, Shield, AlertTriangle } from "lucide-react";

interface Connector {
  id: string;
  type: "CCS2" | "Type2" | "CHAdeMO";
  power: number;
  pricePerKwh: number;
  status: "available" | "charging" | "occupied" | "offline";
}

interface ChargingStation {
  id: string;
  name: string;
  location: string;
  connectors: Connector[];
}

export default function Home() {
  const router = useRouter();
  const [stations, setStations] = useState<ChargingStation[]>([]);
  const [chargerIdInput, setChargerIdInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch stations on mount
  useEffect(() => {
    fetchStations();
  }, []);

  const fetchStations = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/stations");
      const data = await res.json();
      if (data.success) {
        setStations(data.stations);
      } else {
        setError("ไม่สามารถดึงข้อมูลสถานีชาร์จได้");
      }
    } catch (err) {
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chargerIdInput.trim()) return;
    
    const targetId = chargerIdInput.trim().toUpperCase();
    const stationExists = stations.some(s => s.id === targetId);
    
    if (stationExists) {
      router.push(`/charger/${targetId}`);
    } else {
      setError("ไม่พบรหัสเครื่องชาร์จนี้ในระบบ กรุณาลองใหม่อีกครั้ง (เช่น EV-BKK-001)");
    }
  };

  // Helper to count available connectors
  const getAvailableCount = (connectors: Connector[]) => {
    return connectors.filter(c => c.status === "available").length;
  };

  return (
    <div className="flex-1 flex flex-col justify-start items-center px-4 py-8 max-w-md mx-auto w-full">
      {/* Hero Badge */}
      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold mb-6">
        <Zap size={12} className="animate-pulse" />
        <span>ระบบชาร์จรถไฟฟ้าอัจฉริยะ 100% Mobile Web</span>
      </div>

      {/* Main Banner / Title */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight mb-2 bg-gradient-to-r from-slate-100 via-slate-200 to-cyan-400 bg-clip-text text-transparent">
          สแกน จ่าย เริ่มชาร์จ
        </h1>
        <p className="text-sm text-zinc-400">
          สแกน QR Code ที่ตู้ชาร์จ หรือกรอกรหัสเพื่อใช้บริการได้ทันที
        </p>
      </div>

      {/* QR Code / Charger Code Scanner Mock */}
      <div className="w-full glass-panel rounded-2xl p-6 border border-zinc-800/80 mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl"></div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex justify-center mb-4">
            <div className="relative p-6 rounded-2xl bg-zinc-950/80 border border-zinc-800 flex items-center justify-center glow-active-cyan">
              <QrCode size={48} className="text-cyan-400" />
              <div className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
              </div>
            </div>
          </div>

          <div className="text-center mb-2">
            <span className="text-xs text-zinc-400 uppercase tracking-widest font-semibold">ระบุรหัสเครื่องชาร์จ</span>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="ตัวอย่าง: EV-BKK-001"
              value={chargerIdInput}
              onChange={(e) => {
                setChargerIdInput(e.target.value);
                setError("");
              }}
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

      {/* Safety & Secure badges */}
      <div className="w-full flex justify-between gap-4 px-2 py-3 rounded-xl bg-zinc-950/40 border border-zinc-900 mb-8">
        <div className="flex items-center gap-2 text-zinc-400">
          <Shield size={14} className="text-cyan-400" />
          <span className="text-2xs font-medium">เข้ารหัสความปลอดภัย SSL</span>
        </div>
        <div className="flex items-center gap-2 text-zinc-400">
          <Zap size={14} className="text-cyan-400" />
          <span className="text-2xs font-medium">เชื่อมโยง API สถานีชาร์จตรง</span>
        </div>
      </div>

      {/* Stations Directory Section (For Demo Navigation) */}
      <div className="w-full">
        <div className="flex justify-between items-center mb-4 px-1">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">สถานีชาร์จใกล้คุณ (สำหรับการสาธิต)</h2>
          <button onClick={fetchStations} className="text-2xs text-cyan-400 hover:underline">รีเฟรช</button>
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-3">
            {[1, 2].map((i) => (
              <div key={i} className="w-full h-24 rounded-xl bg-zinc-900/40 border border-zinc-800/50 shimmer"></div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {stations.map((station) => {
              const avail = getAvailableCount(station.connectors);
              return (
                <div
                  key={station.id}
                  onClick={() => router.push(`/charger/${station.id}`)}
                  className="w-full text-left p-4 rounded-xl bg-zinc-900/30 border border-zinc-800 hover:border-cyan-500/50 hover:bg-zinc-900/50 transition-all cursor-pointer group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-mono text-2xs text-cyan-400 font-bold bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                      {station.id}
                    </span>
                    <span className={`text-2xs font-bold px-2 py-0.5 rounded ${
                      avail > 0 ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/20" : "bg-zinc-800 text-zinc-400"
                    }`}>
                      {avail > 0 ? `ว่าง ${avail} หัวชาร์จ` : "เต็มทุกช่อง"}
                    </span>
                  </div>
                  
                  <h3 className="font-semibold text-slate-100 text-sm mb-1 group-hover:text-cyan-400 transition-colors">
                    {station.name}
                  </h3>
                  
                  <div className="flex items-center gap-1 text-zinc-500 text-2xs">
                    <MapPin size={12} className="shrink-0" />
                    <span className="truncate">{station.location}</span>
                  </div>

                  <div className="mt-3 pt-3 border-t border-zinc-800/80 flex gap-2">
                    {station.connectors.map((c, idx) => (
                      <span
                        key={idx}
                        className={`text-3xs font-mono px-1.5 py-0.5 rounded border ${
                          c.status === "available"
                            ? "border-cyan-500/20 bg-cyan-500/5 text-cyan-400"
                            : c.status === "charging" || c.status === "occupied"
                            ? "border-amber-500/20 bg-amber-500/5 text-amber-400"
                            : "border-zinc-800 bg-zinc-950 text-zinc-600"
                        }`}
                      >
                        {c.type} ({c.power}kW)
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
