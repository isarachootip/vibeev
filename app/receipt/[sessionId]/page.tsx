"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Zap, Clock, DollarSign, ArrowRight, MapPin, ReceiptText } from "lucide-react";

interface ChargingSession {
  id: string;
  chargerId: string;
  connectorId: string;
  status: "pending_payment" | "charging" | "completed";
  startTime?: string;
  endTime?: string;
  targetType: "full" | "duration" | "amount" | "kwh";
  targetValue: number;
  energyDelivered: number;
  soc: number;
  cost: number;
  powerKW: number;
  paymentStatus: "pending" | "paid" | "failed";
  carPlate?: string;
}

interface PageProps {
  params: Promise<{ sessionId: string }>;
}

export default function ReceiptPage({ params }: PageProps) {
  const router = useRouter();
  const { sessionId } = use(params);

  const [session, setSession] = useState<ChargingSession | null>(null);
  const [stationName, setStationName] = useState("");
  const [connectorType, setConnectorType] = useState("");
  const [pricePerKwh, setPricePerKwh] = useState(0);
  const [duration, setDuration] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSession();
  }, [sessionId]);

  const fetchSession = async () => {
    try {
      const res = await fetch(`/api/charger/session/${sessionId}`);
      const data = await res.json();
      
      if (data.success) {
        setSession(data.session);
        
        // Fetch station & connector details to render nice receipt properties
        const stationRes = await fetch("/api/stations");
        const stationData = await stationRes.json();
        if (stationData.success) {
          const stationObj = stationData.stations.find((s: any) => s.id === data.session.chargerId);
          if (stationObj) {
            setStationName(stationObj.name);
            const connObj = stationObj.connectors.find((c: any) => c.id === data.session.connectorId);
            if (connObj) {
              setConnectorType(connObj.type);
              setPricePerKwh(connObj.pricePerKwh);
            }
          }
        }

        // Calculate actual elapsed duration
        if (data.session.startTime && data.session.endTime) {
          const start = new Date(data.session.startTime);
          const end = new Date(data.session.endTime);
          const diffMs = end.getTime() - start.getTime();
          
          // Simulated speedup factor 30x in billing history
          const SpeedMultiplier = 30;
          const simulatedDiffMs = diffMs * SpeedMultiplier;

          const seconds = Math.floor((simulatedDiffMs / 1000) % 60);
          const minutes = Math.floor((simulatedDiffMs / (1000 * 60)) % 60);
          const hours = Math.floor((simulatedDiffMs / (1000 * 60 * 60)) % 24);

          const formatted = [
            hours > 0 ? `${hours} ชม.` : null,
            minutes > 0 ? `${minutes} นาที` : null,
            `${seconds} วินาที`,
          ].filter(Boolean).join(" ");
          
          setDuration(formatted);
        }

        setIsLoading(false);
      } else {
        setError("ไม่สามารถดึงข้อมูลประวัติการชาร์จได้");
      }
    } catch (err) {
      setError("เกิดความผิดพลาดในการเรียกดูข้อมูล");
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center p-8 max-w-md mx-auto w-full">
        <div className="h-10 w-10 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mb-4"></div>
        <p className="text-sm text-zinc-400">กำลังดึงข้อมูลใบเสร็จรับเงิน...</p>
      </div>
    );
  }

  if (error && !session) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center p-8 max-w-md mx-auto w-full text-center">
        <p className="text-rose-400 mb-4">{error}</p>
        <button onClick={() => router.push("/")} className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-semibold">
          กลับหน้าหลัก
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col justify-start items-center px-4 py-6 max-w-md mx-auto w-full">
      {/* Success Animation Header */}
      <div className="text-center mb-6 mt-4">
        <div className="inline-flex items-center justify-center p-3 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mb-4 animate-scale-in">
          <CheckCircle2 size={40} />
        </div>
        <h1 className="text-2xl font-bold text-slate-100">การชาร์จเสร็จสิ้น</h1>
        <p className="text-xs text-zinc-400 mt-1">ชำระเงินและหยุดส่งจ่ายกระแสไฟเรียบร้อยแล้ว</p>
      </div>

      {/* Invoice Layout */}
      {session && (
        <div className="w-full glass-panel rounded-2xl p-6 border border-zinc-800/80 mb-6 relative">
          {/* Top circle punches for receipt ticket effect */}
          <div className="absolute -left-3 top-1/3 w-6 h-6 rounded-full bg-[#07080e] border-r border-zinc-800/80"></div>
          <div className="absolute -right-3 top-1/3 w-6 h-6 rounded-full bg-[#07080e] border-l border-zinc-800/80"></div>

          {/* Receipt header */}
          <div className="flex justify-between items-start pb-4 border-b border-dashed border-zinc-800 mb-5">
            <div>
              <span className="text-3xs uppercase tracking-wider font-semibold text-zinc-500">หมายเลขใบเสร็จ</span>
              <div className="font-mono text-xs text-zinc-300 font-bold mt-0.5">{session.id}</div>
            </div>
            <div className="text-right">
              <span className="text-3xs uppercase tracking-wider font-semibold text-zinc-500">วันเวลาที่ทำรายการ</span>
              <div className="font-mono text-xs text-zinc-300 mt-0.5">
                {session.endTime ? new Date(session.endTime).toLocaleString("th-TH") : "-"}
              </div>
            </div>
          </div>

          {/* Station Details */}
          <div className="mb-5">
            <h3 className="font-bold text-sm text-slate-200">{stationName || "สถานีชาร์จ VOLTCHARGE"}</h3>
            <span className="text-2xs text-zinc-500 flex items-center gap-1 mt-0.5">
              <MapPin size={10} className="shrink-0" />
              <span>รหัสเครื่อง {session.chargerId} • หัวชาร์จ {session.connectorId} ({connectorType})</span>
            </span>
          </div>

          {/* Table summary of charging parameters */}
          <div className="flex flex-col gap-3 pb-5 border-b border-zinc-800 mb-5">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-500 flex items-center gap-1">
                <Clock size={12} /> เวลาที่ชาร์จจริง
              </span>
              <span className="text-zinc-300 font-semibold">{duration || "-"}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-zinc-500 flex items-center gap-1">
                <Zap size={12} /> ปริมาณไฟฟ้าที่เติม
              </span>
              <span className="text-zinc-300 font-semibold font-mono">{session.energyDelivered.toFixed(2)} kWh</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-zinc-500 flex items-center gap-1">
                <ReceiptText size={12} /> อัตราค่าบริการ
              </span>
              <span className="text-zinc-300 font-semibold font-mono">฿{pricePerKwh.toFixed(2)} / kWh</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-zinc-500 flex items-center gap-1">
                🚗 ทะเบียนรถยนต์
              </span>
              <span className="text-zinc-300 font-semibold">{session.carPlate}</span>
            </div>
          </div>

          {/* Final Cost billing summary */}
          <div className="flex justify-between items-center bg-zinc-950 p-4 rounded-xl border border-zinc-900">
            <div>
              <span className="text-3xs uppercase tracking-widest text-zinc-500 font-semibold block">ยอดชำระสุทธิ</span>
              <span className="text-2xs text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-1.5 py-0.5 rounded font-bold mt-1 inline-block">
                ชำระเงินสำเร็จ
              </span>
            </div>
            <div className="text-right">
              <span className="text-2xl font-extrabold font-mono text-cyan-400">฿{session.cost}</span>
              <span className="text-3xs text-zinc-500 block">ชำระผ่าน PromptPay QR</span>
            </div>
          </div>
        </div>
      )}

      {/* Done button */}
      <button
        onClick={() => router.push("/")}
        className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 font-bold text-black flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-cyan-500/10 active:scale-[0.98]"
      >
        <span>เสร็จสิ้นและกลับหน้าหลัก</span>
        <ArrowRight size={16} />
      </button>
    </div>
  );
}
