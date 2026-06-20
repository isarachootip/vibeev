"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { StopCircle, BatteryCharging, Zap, DollarSign, Clock, CheckCircle } from "lucide-react";

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

export default function ChargingPage({ params }: PageProps) {
  const router = useRouter();
  const { sessionId } = use(params);

  const [session, setSession] = useState<ChargingSession | null>(null);
  const [elapsedTime, setElapsedTime] = useState<string>("00:00");
  const [isLoading, setIsLoading] = useState(true);
  const [isStopping, setIsStopping] = useState(false);
  const [error, setError] = useState("");

  // Poll session data
  useEffect(() => {
    fetchSession(); // Initial fetch

    const interval = setInterval(() => {
      fetchSession();
    }, 1500); // Fetch every 1.5 seconds to capture simulation progress

    return () => clearInterval(interval);
  }, [sessionId]);

  // Update elapsed time timer
  useEffect(() => {
    if (!session || session.status !== "charging" || !session.startTime) return;

    const timer = setInterval(() => {
      const start = new Date(session.startTime || "");
      const now = new Date();
      const diffMs = now.getTime() - start.getTime();
      
      // Since our simulation speeds up time (30x), let's reflect that speedup in the timer!
      // 1 sec real time = 30 seconds simulated time.
      const SpeedMultiplier = 30;
      const simulatedDiffMs = diffMs * SpeedMultiplier;

      const seconds = Math.floor((simulatedDiffMs / 1000) % 60);
      const minutes = Math.floor((simulatedDiffMs / (1000 * 60)) % 60);
      const hours = Math.floor((simulatedDiffMs / (1000 * 60 * 60)) % 24);

      const formatted = [
        hours > 0 ? String(hours).padStart(2, "0") : null,
        String(minutes).padStart(2, "0"),
        String(seconds).padStart(2, "0"),
      ].filter(Boolean).join(":");

      setElapsedTime(formatted);
    }, 1000);

    return () => clearInterval(timer);
  }, [session]);

  const fetchSession = async () => {
    try {
      const res = await fetch(`/api/charger/session/${sessionId}`);
      const data = await res.json();
      
      if (data.success) {
        setSession(data.session);
        setIsLoading(false);

        // If charging completed, redirect to receipt
        if (data.session.status === "completed") {
          router.push(`/receipt/${sessionId}`);
        }
      } else {
        setError("ไม่สามารถดึงข้อมูลการชาร์จได้");
      }
    } catch (err) {
      setError("เกิดปัญหาการเชื่อมต่อเครือข่าย");
    }
  };

  const handleStopCharging = async () => {
    if (isStopping) return;
    setIsStopping(true);
    
    try {
      const res = await fetch(`/api/charger/session/${sessionId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "stop_charging" })
      });
      const data = await res.json();
      if (data.success) {
        router.push(`/receipt/${sessionId}`);
      } else {
        setError("ไม่สามารถหยุดการชาร์จได้: " + data.error);
        setIsStopping(false);
      }
    } catch (err) {
      setError("เกิดข้อผิดพลาดในการส่งคำสั่งหยุดชาร์จ");
      setIsStopping(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center p-8 max-w-md mx-auto w-full">
        <div className="h-10 w-10 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mb-4"></div>
        <p className="text-sm text-zinc-400">กำลังเชื่อมต่อกับระบบควบคุมเครื่องชาร์จ...</p>
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

  // Calculate circular stroke offset for gauge
  const radius = 80;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = session ? circumference - (session.soc / 100) * circumference : circumference;

  return (
    <div className="flex-1 flex flex-col justify-start items-center px-4 py-6 max-w-md mx-auto w-full">
      {/* Session Title Badge */}
      <div className="w-full flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
          </span>
          <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">กำลังจ่ายกระแสไฟ...</span>
        </div>
        <span className="font-mono text-2xs text-zinc-500">Session: {sessionId}</span>
      </div>

      {session && (
        <>
          {/* Charger Gauge UI */}
          <div className="relative w-64 h-64 flex items-center justify-center mb-6">
            {/* Outer Circular Path */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
              <circle
                cx="100"
                cy="100"
                r={radius}
                className="stroke-zinc-900 fill-none"
                strokeWidth={strokeWidth}
              />
              <circle
                cx="100"
                cy="100"
                r={radius}
                className="stroke-blue-500 fill-none transition-all duration-500 ease-out"
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>

            {/* Inner Content */}
            <div className="absolute text-center flex flex-col items-center justify-center">
              <BatteryCharging size={32} className="text-blue-400 mb-1.5 animate-bounce" />
              <span className="text-4xl font-extrabold font-mono text-slate-50 tracking-tighter">
                {session.soc}%
              </span>
              <span className="text-3xs text-zinc-500 uppercase tracking-widest mt-1">State of Charge</span>
              <span className="text-2xs text-cyan-400 font-mono font-bold mt-1.5 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-full">
                ⚡ {session.powerKW} kW
              </span>
            </div>

            {/* Neon Glow Outer effect */}
            <div className="absolute inset-0 rounded-full glow-active-blue -z-10 pointer-events-none scale-90"></div>
          </div>

          {/* Session Limit Banner */}
          <div className="w-full mb-6 text-center py-2 bg-blue-500/5 border border-blue-500/10 rounded-xl">
            <span className="text-3xs uppercase tracking-widest text-zinc-500 block">เงื่อนไขการหยุดชาร์จ</span>
            <span className="text-xs font-bold text-slate-300">
              {session.targetType === "full" && "ชาร์จจนเต็มความจุ (100%)"}
              {session.targetType === "amount" && `จำกัดจำนวนเงินไม่เกิน ฿${session.targetValue}`}
              {session.targetType === "kwh" && `จำกัดจำนวนหน่วยไฟฟ้าไม่เกิน ${session.targetValue} kWh`}
              {session.targetType === "duration" && `จำกัดเวลาชาร์จไม่เกิน ${session.targetValue} นาที`}
            </span>
          </div>

          {/* Live Telemetry Cards */}
          <div className="grid grid-cols-2 gap-4 w-full mb-8">
            <div className="glass-panel p-4 rounded-xl text-left relative overflow-hidden">
              <div className="flex justify-between items-center mb-1 text-zinc-500">
                <span className="text-3xs uppercase tracking-wider font-semibold">พลังงานไฟฟ้า</span>
                <Zap size={14} className="text-blue-400" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold font-mono text-slate-100">{session.energyDelivered}</span>
                <span className="text-2xs text-zinc-500">kWh</span>
              </div>
            </div>

            <div className="glass-panel p-4 rounded-xl text-left relative overflow-hidden">
              <div className="flex justify-between items-center mb-1 text-zinc-500">
                <span className="text-3xs uppercase tracking-wider font-semibold">ค่าใช้จ่ายสะสม</span>
                <DollarSign size={14} className="text-cyan-400" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold font-mono text-cyan-400 font-mono">฿{session.cost}</span>
                <span className="text-2xs text-zinc-500">บาท</span>
              </div>
            </div>

            <div className="glass-panel p-4 rounded-xl text-left relative overflow-hidden col-span-2 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-zinc-950 border border-zinc-900">
                  <Clock size={16} className="text-zinc-400" />
                </div>
                <div>
                  <div className="text-3xs uppercase tracking-wider font-semibold text-zinc-500">เวลาที่ใช้ชาร์จ</div>
                  <div className="font-mono text-sm font-bold text-slate-200">{elapsedTime}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xs uppercase tracking-wider font-semibold text-zinc-500">ทะเบียนรถ</div>
                <div className="font-semibold text-xs text-slate-300">{session.carPlate || "-"}</div>
              </div>
            </div>
          </div>

          {/* Info notification */}
          <div className="w-full text-center text-3xs text-zinc-500 mb-6 bg-zinc-950 p-3 rounded-lg border border-zinc-900">
            * ระบบทำการจำลองเวลาและปริมาณไฟฟ้าเร่งสปีดขึ้น 30 เท่า เพื่อความสะดวกรวดเร็วในการทดสอบสาธิตระบบ
          </div>

          {/* Stop Button */}
          {error && (
            <div className="w-full p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs mb-4">
              {error}
            </div>
          )}

          <button
            onClick={handleStopCharging}
            disabled={isStopping}
            className="w-full py-4 rounded-xl bg-rose-600/20 border border-rose-600/40 text-rose-400 hover:bg-rose-600/30 hover:border-rose-600/60 font-bold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {isStopping ? (
              <span className="h-4 w-4 border-2 border-rose-500/20 border-t-rose-500 rounded-full animate-spin"></span>
            ) : (
              <StopCircle size={18} />
            )}
            <span>สั่งหยุดชาร์จทันที (Stop)</span>
          </button>
        </>
      )}
    </div>
  );
}
