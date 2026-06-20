"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Zap, MapPin, CreditCard, CheckCircle2, ShieldCheck, Info } from "lucide-react";
import Image from "next/image";

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

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ChargerPage({ params }: PageProps) {
  const router = useRouter();
  const { id } = use(params); // Next.js 15+ params Promise unwrapping

  const [station, setStation] = useState<ChargingStation | null>(null);
  const [selectedConnectorId, setSelectedConnectorId] = useState<string>("");
  const [targetType, setTargetType] = useState<"full" | "amount" | "kwh" | "duration">("full");
  const [targetValue, setTargetValue] = useState<string>("100"); // 100% for full, or amount value
  const [carPlate, setCarPlate] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Payment Screen state
  const [paymentSession, setPaymentSession] = useState<any | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    fetchStation();
  }, [id]);

  const fetchStation = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/stations");
      const data = await res.json();
      if (data.success) {
        const found = data.stations.find((s: ChargingStation) => s.id === id);
        if (found) {
          setStation(found);
          // Auto-select first available connector
          const firstAvail = found.connectors.find((c: Connector) => c.status === "available");
          if (firstAvail) {
            setSelectedConnectorId(firstAvail.id);
          }
        } else {
          setError("ไม่พบรหัสเครื่องชาร์จนี้ในระบบ");
        }
      } else {
        setError("ไม่สามารถดึงข้อมูลได้");
      }
    } catch (err) {
      setError("การเชื่อมต่อมีปัญหา");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePresetAmount = (value: string) => {
    setTargetValue(value);
  };

  const handleStartProcess = async () => {
    if (!selectedConnectorId) {
      setError("กรุณาเลือกหัวชาร์จ");
      return;
    }

    const conn = station?.connectors.find(c => c.id === selectedConnectorId);
    if (!conn || conn.status !== "available") {
      setError("หัวชาร์จนี้ไม่ว่างในขณะนี้ กรุณาเลือกหัวชาร์จอื่น");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chargerId: id,
          connectorId: selectedConnectorId,
          targetType,
          targetValue: Number(targetValue),
          carPlate: carPlate || "กข-9999"
        })
      });
      const data = await res.json();
      
      if (data.success) {
        setPaymentSession(data.session);
        setShowPaymentModal(true);
      } else {
        setError(data.error || "ไม่สามารถเริ่มรายการชำระเงินได้");
      }
    } catch (err) {
      setError("เกิดข้อผิดพลาดระหว่างส่งข้อมูล");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSimulatePaymentSuccess = async () => {
    if (!paymentSession) return;
    setIsSubmitting(true);
    
    try {
      const res = await fetch(`/api/charger/session/${paymentSession.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "confirm_payment" })
      });
      const data = await res.json();
      if (data.success) {
        setShowPaymentModal(false);
        router.push(`/charging/${paymentSession.id}`);
      } else {
        setError("การชำระเงินขัดข้อง: " + data.error);
      }
    } catch (err) {
      setError("เกิดปัญหาการจำลองการจ่ายเงิน");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center p-8 max-w-md mx-auto w-full">
        <div className="h-10 w-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
        <p className="text-sm text-zinc-400">กำลังโหลดรายละเอียดตู้ชาร์จ...</p>
      </div>
    );
  }

  if (error && !station) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center p-8 max-w-md mx-auto w-full text-center">
        <div className="p-4 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 mb-4">
          <Info size={24} />
        </div>
        <h3 className="font-bold mb-2">ไม่พบเครื่องชาร์จ</h3>
        <p className="text-sm text-zinc-400 mb-6">{error}</p>
        <button onClick={() => router.push("/")} className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-semibold">
          กลับหน้าหลัก
        </button>
      </div>
    );
  }

  const selectedConn = station?.connectors.find(c => c.id === selectedConnectorId);

  return (
    <div className="flex-1 flex flex-col justify-start items-center px-4 py-6 max-w-md mx-auto w-full relative">
      {/* Header Navigation */}
      <div className="w-full flex items-center justify-between mb-6">
        <button 
          onClick={() => router.push("/")}
          className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-slate-100 transition-all cursor-pointer"
        >
          <ArrowLeft size={16} />
        </button>
        <span className="font-mono text-xs font-bold text-zinc-500">
          ID: {id}
        </span>
        <div className="w-8"></div> {/* spacer */}
      </div>

      {station && (
        <>
          {/* Station Title Banner */}
          <div className="w-full mb-6">
            <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <Zap size={20} className="text-emerald-400 shrink-0" />
              <span>{station.name}</span>
            </h1>
            <p className="text-xs text-zinc-400 mt-1 flex items-start gap-1">
              <MapPin size={12} className="shrink-0 mt-0.5" />
              <span>{station.location}</span>
            </p>
          </div>

          {/* Connectors Selection Grid */}
          <div className="w-full mb-6">
            <span className="text-xs uppercase tracking-wider font-semibold text-zinc-400 block mb-3 px-1">
              1. เลือกหัวชาร์จ (Connectors)
            </span>
            <div className="grid grid-cols-1 gap-3">
              {station.connectors.map((c) => {
                const isSelected = selectedConnectorId === c.id;
                const isAvail = c.status === "available";
                return (
                  <div
                    key={c.id}
                    onClick={() => isAvail && setSelectedConnectorId(c.id)}
                    className={`p-4 rounded-xl border transition-all relative ${
                      !isAvail 
                        ? "opacity-50 border-zinc-900 bg-zinc-950/40 cursor-not-allowed" 
                        : isSelected
                        ? "border-emerald-500 bg-emerald-500/5 cursor-pointer glow-active-green"
                        : "border-zinc-800 bg-zinc-900/30 hover:border-zinc-700 cursor-pointer"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <span className={`p-2 rounded-lg font-bold text-2xs ${
                          isSelected ? "bg-emerald-500/20 text-emerald-400" : "bg-zinc-800 text-zinc-400"
                        }`}>
                          {c.type}
                        </span>
                        <div>
                          <div className="font-semibold text-sm text-slate-200">
                            หัวชาร์จ {c.id} ({c.power} kW)
                          </div>
                          <div className="text-2xs text-zinc-400">
                            ราคา {c.pricePerKwh.toFixed(2)} บาท/kWh
                          </div>
                        </div>
                      </div>
                      <span className={`text-2xs font-bold px-2 py-0.5 rounded ${
                        c.status === "available"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : c.status === "charging"
                          ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                          : "bg-zinc-800 text-zinc-500"
                      }`}>
                        {c.status === "available" ? "ว่าง" : c.status === "charging" ? "กำลังชาร์จ" : "ไม่ว่าง"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Charging Target (Limits) */}
          <div className="w-full mb-6">
            <span className="text-xs uppercase tracking-wider font-semibold text-zinc-400 block mb-3 px-1">
              2. ระบุปริมาณการชาร์จ
            </span>
            <div className="grid grid-cols-4 gap-2 mb-4 bg-zinc-950 p-1 rounded-xl border border-zinc-900">
              {(["full", "amount", "kwh", "duration"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    setTargetType(type);
                    if (type === "full") setTargetValue("100");
                    else if (type === "amount") setTargetValue("300");
                    else if (type === "kwh") setTargetValue("30");
                    else if (type === "duration") setTargetValue("30");
                  }}
                  className={`py-2 px-1 rounded-lg text-2xs font-semibold capitalize transition-all cursor-pointer ${
                    targetType === type
                      ? "bg-zinc-800 text-emerald-400"
                      : "text-zinc-400 hover:text-slate-100"
                  }`}
                >
                  {type === "full" ? "เต็มถัง" : type === "amount" ? "ระบุเงิน" : type === "kwh" ? "ระบุ kWh" : "เวลา"}
                </button>
              ))}
            </div>

            {/* Target Input field depending on type */}
            <div className="glass-panel p-4 rounded-xl border border-zinc-800/80">
              {targetType === "full" && (
                <div className="text-center py-2">
                  <p className="text-xs text-zinc-400">ชาร์จไฟจนเต็มความจุของแบตเตอรี่รถยนต์ไฟฟ้า (100% SOC)</p>
                  <p className="text-sm font-bold text-emerald-400 mt-1">ระบบจะคิดเงินจริงตามปริมาณไฟฟ้าที่จ่ายจริง</p>
                </div>
              )}

              {targetType === "amount" && (
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs text-zinc-400">ระบุจำนวนเงิน</span>
                    <span className="text-xs font-bold text-emerald-400">บาท</span>
                  </div>
                  <input
                    type="number"
                    value={targetValue}
                    onChange={(e) => setTargetValue(e.target.value)}
                    className="w-full py-2 px-3 rounded-lg bg-zinc-950 border border-zinc-800 text-center font-mono text-lg font-bold text-slate-100 outline-none focus:border-emerald-500"
                  />
                  <div className="grid grid-cols-4 gap-2 mt-3">
                    {["100", "300", "500", "1000"].map((p) => (
                      <button
                        key={p}
                        onClick={() => handlePresetAmount(p)}
                        type="button"
                        className="py-1.5 rounded-lg border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 text-xs font-mono font-semibold"
                      >
                        ฿{p}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {targetType === "kwh" && (
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs text-zinc-400">ระบุหน่วยไฟฟ้า</span>
                    <span className="text-xs font-bold text-emerald-400">kWh</span>
                  </div>
                  <input
                    type="number"
                    value={targetValue}
                    onChange={(e) => setTargetValue(e.target.value)}
                    className="w-full py-2 px-3 rounded-lg bg-zinc-950 border border-zinc-800 text-center font-mono text-lg font-bold text-slate-100 outline-none focus:border-emerald-500"
                  />
                  <div className="grid grid-cols-4 gap-2 mt-3">
                    {["10", "20", "40", "60"].map((p) => (
                      <button
                        key={p}
                        onClick={() => handlePresetAmount(p)}
                        type="button"
                        className="py-1.5 rounded-lg border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 text-xs font-mono font-semibold"
                      >
                        {p} kWh
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {targetType === "duration" && (
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs text-zinc-400">ระบุระยะเวลา</span>
                    <span className="text-xs font-bold text-emerald-400">นาที</span>
                  </div>
                  <input
                    type="number"
                    value={targetValue}
                    onChange={(e) => setTargetValue(e.target.value)}
                    className="w-full py-2 px-3 rounded-lg bg-zinc-950 border border-zinc-800 text-center font-mono text-lg font-bold text-slate-100 outline-none focus:border-emerald-500"
                  />
                  <div className="grid grid-cols-4 gap-2 mt-3">
                    {["15", "30", "45", "60"].map((p) => (
                      <button
                        key={p}
                        onClick={() => handlePresetAmount(p)}
                        type="button"
                        className="py-1.5 rounded-lg border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 text-xs font-mono font-semibold"
                      >
                        {p} นาที
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Vehicle Information */}
          <div className="w-full mb-6">
            <span className="text-xs uppercase tracking-wider font-semibold text-zinc-400 block mb-3 px-1">
              3. ข้อมูลรถยนต์ไฟฟ้า
            </span>
            <input
              type="text"
              placeholder="กรอกทะเบียนรถยนต์ (เช่น 3กข-9999 กทม.)"
              value={carPlate}
              onChange={(e) => setCarPlate(e.target.value)}
              className="w-full py-3 px-4 rounded-xl bg-zinc-950 border border-zinc-800 focus:border-emerald-500 outline-none text-slate-100 transition-all placeholder:text-zinc-600 text-sm"
            />
          </div>

          {/* Action button */}
          {error && (
            <div className="w-full p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs mb-4">
              {error}
            </div>
          )}

          <button
            onClick={handleStartProcess}
            disabled={isSubmitting || !selectedConnectorId}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 font-bold text-black flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CreditCard size={18} />
            <span>ชำระเงินและเริ่มชาร์จ</span>
          </button>
        </>
      )}

      {/* PROMPTPAY QR SIMULATION MODAL */}
      {showPaymentModal && paymentSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-[#0c0d14] p-6 text-center shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
                การชำระเงินจำลอง
              </span>
              <button 
                onClick={() => setShowPaymentModal(false)}
                className="text-zinc-500 hover:text-slate-100 text-xs px-2 py-1 bg-zinc-900 border border-zinc-800 rounded-lg cursor-pointer"
              >
                ยกเลิก
              </button>
            </div>

            {/* PromptPay Branding Header */}
            <div className="bg-[#0f2a4a] text-white py-3 px-6 rounded-xl flex items-center justify-between mb-4 border border-[#1d4474]">
              <span className="font-extrabold text-sm tracking-wider uppercase text-sky-300">PromptPay</span>
              <span className="text-2xs font-semibold bg-sky-500/20 text-sky-400 border border-sky-400/20 px-2 py-0.5 rounded">
                E-Wallet QR
              </span>
            </div>

            {/* QR Code Graphic Box */}
            <div className="bg-white p-4 rounded-xl inline-block mx-auto mb-4 border border-zinc-200">
              {/* Custom SVG PromptPay QR Code Mock */}
              <svg width="180" height="180" viewBox="0 0 100 100" className="mx-auto">
                <rect width="100" height="100" fill="white" />
                {/* QR Finder patterns */}
                <rect x="5" y="5" width="25" height="25" fill="#0c0d14" />
                <rect x="8" y="8" width="19" height="19" fill="white" />
                <rect x="11" y="11" width="13" height="13" fill="#0c0d14" />

                <rect x="70" y="5" width="25" height="25" fill="#0c0d14" />
                <rect x="73" y="8" width="19" height="19" fill="white" />
                <rect x="76" y="11" width="13" height="13" fill="#0c0d14" />

                <rect x="5" y="70" width="25" height="25" fill="#0c0d14" />
                <rect x="8" y="73" width="19" height="19" fill="white" />
                <rect x="11" y="76" width="13" height="13" fill="#0c0d14" />

                {/* Simulated QR blocks */}
                <rect x="35" y="5" width="10" height="5" fill="#0c0d14" />
                <rect x="55" y="5" width="10" height="10" fill="#0c0d14" />
                <rect x="40" y="15" width="20" height="5" fill="#0c0d14" />
                
                <rect x="35" y="30" width="30" height="10" fill="#0f2a4a" />
                <rect x="10" y="35" width="15" height="5" fill="#0c0d14" />
                <rect x="15" y="45" width="10" height="10" fill="#0c0d14" />

                <rect x="40" y="50" width="20" height="20" fill="#0c0d14" />
                <rect x="70" y="40" width="15" height="5" fill="#0f2a4a" />
                <rect x="80" y="50" width="15" height="15" fill="#0c0d14" />

                <rect x="35" y="75" width="10" height="15" fill="#0c0d14" />
                <rect x="55" y="80" width="20" height="10" fill="#0c0d14" />
              </svg>
            </div>

            {/* Total Amount Details */}
            <div className="mb-6 bg-zinc-950 py-3 px-4 rounded-xl border border-zinc-900">
              <span className="text-2xs text-zinc-500 block">จำนวนเงินชำระ</span>
              <span className="text-xl font-bold font-mono text-emerald-400">
                ฿{targetType === "full" ? "1,000.00" : Number(targetValue).toFixed(2)}
              </span>
              <span className="text-3xs text-zinc-500 block mt-1">
                {targetType === "full" 
                  ? "* มัดจำการชาร์จเต็มถัง (คืนเงินส่วนต่างหลังชาร์จเสร็จ)" 
                  : `* สำหรับชาร์จ ${targetType === "amount" ? `${targetValue} บาท` : targetType === "kwh" ? `${targetValue} kWh` : `${targetValue} นาที`}`}
              </span>
            </div>

            {/* Demo Instruction */}
            <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs text-left mb-6">
              <ShieldCheck size={16} className="shrink-0" />
              <span>
                <strong>ระบบสำหรับการสาธิต:</strong> กดปุ่มจำลองด้านล่างเพื่อประมวลผลการจ่ายเงินสำเร็จและเริ่มจ่ายกระแสไฟฟ้าไปยังรถ
              </span>
            </div>

            {/* Simulation button */}
            <button
              onClick={handleSimulatePaymentSuccess}
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 font-bold text-black flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="h-4 w-4 border-2 border-black/20 border-t-black rounded-full animate-spin"></span>
              ) : (
                <CheckCircle2 size={16} />
              )}
              <span>จำลองการชำระเงินสำเร็จ ⚡</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
