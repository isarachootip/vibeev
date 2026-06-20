"use client";

import { useState, useEffect } from "react";
import { Zap, DollarSign, Activity, Settings, Power, RefreshCw, Layers, CheckCircle2, Clock, AlertCircle } from "lucide-react";

interface Connector {
  id: string;
  type: "CCS2" | "Type2" | "CHAdeMO";
  power: number;
  pricePerKwh: number;
  status: "available" | "charging" | "occupied" | "offline";
  currentSessionId?: string | null;
}

interface ChargingStation {
  id: string;
  name: string;
  location: string;
  connectors: Connector[];
}

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

export default function AdminDashboard() {
  const [stations, setStations] = useState<ChargingStation[]>([]);
  const [sessions, setSessions] = useState<ChargingSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActioning, setIsActioning] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Poll database state
  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 2000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch("/api/stations");
      const data = await res.json();
      if (data.success) {
        setStations(data.stations);
        setSessions(data.sessions || []);
      }
    } catch (err) {
      setError("เกิดปัญหาดึงข้อมูลแดชบอร์ด");
    } finally {
      setIsLoading(false);
    }
  };

  // Admin Actions
  const handleControlConnector = async (chargerId: string, connectorId: string, action: "force_stop" | "reset") => {
    setIsActioning(`${chargerId}-${connectorId}`);
    setError("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/charger/control", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chargerId, connectorId, action })
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(`ส่งคำสั่ง ${action === "force_stop" ? "หยุดชาร์จ" : "รีเซ็ตหัวชาร์จ"} สำเร็จ`);
        fetchDashboardData();
      } else {
        setError(data.error || "ดำเนินการไม่สำเร็จ");
      }
    } catch (err) {
      setError("เกิดปัญหาการส่งคำสั่งเชื่อมต่อสถานี");
    } finally {
      setIsActioning(null);
      // clear message after 3 seconds
      setTimeout(() => setSuccessMsg(""), 3000);
    }
  };

  const handleResetDatabase = async () => {
    if (!confirm("ท่านประธานต้องการล้างข้อมูลประวัติและรีเซ็ตตู้ชาร์จกลับเป็นค่าเริ่มต้นทั้งหมดหรือไม่?")) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/stations", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg("รีเซ็ตระบบทั้งหมดเรียบร้อยแล้ว");
        fetchDashboardData();
      } else {
        setError("ไม่สามารถรีเซ็ตฐานข้อมูลได้");
      }
    } catch (err) {
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อเพื่อรีเซ็ต");
    } finally {
      setIsLoading(false);
      setTimeout(() => setSuccessMsg(""), 3000);
    }
  };

  // Calculate Metrics from Stations & Sessions
  const totalStations = stations.length;
  let totalConnectors = 0;
  let activeChargingCount = 0;
  let occupiedCount = 0;
  let availableCount = 0;

  stations.forEach(s => {
    s.connectors.forEach(c => {
      totalConnectors++;
      if (c.status === "charging") activeChargingCount++;
      else if (c.status === "occupied") occupiedCount++;
      else if (c.status === "available") availableCount++;
    });
  });

  // Calculate revenue and energy totals from sessions
  const totalRevenue = sessions.reduce((acc, curr) => acc + (curr.paymentStatus === "paid" ? curr.cost : 0), 0);
  const totalEnergy = sessions.reduce((acc, curr) => acc + curr.energyDelivered, 0);

  return (
    <div className="flex-1 max-w-5xl w-full mx-auto px-4 py-8">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-2xs text-emerald-400 font-bold uppercase tracking-wider">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Live Admin Monitoring Control Panel
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight mt-1 text-slate-100 font-sans">
            แผงควบคุมระบบเครือข่าย EV Charger
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            ยินดีต้อนรับท่านประธาน (President) ติดตามสถานะรายได้ ปริมาณไฟฟ้า และควบคุมเครื่องชาร์จเรียบร้อยในหน้าจอเดียว
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleResetDatabase}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-zinc-300 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <RefreshCw size={14} />
            <span>รีเซ็ตค่าเริ่มต้นระบบ</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* High-level Statistics Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="glass-panel p-5 rounded-2xl border border-zinc-800 text-left relative overflow-hidden">
          <div className="flex justify-between items-center text-zinc-500 mb-2">
            <span className="text-3xs uppercase tracking-wider font-semibold">รายได้รวมสะสม</span>
            <DollarSign size={18} className="text-emerald-400" />
          </div>
          <span className="text-2xl font-bold text-emerald-400 font-mono">฿{totalRevenue.toLocaleString("th-TH")}</span>
          <span className="text-3xs text-zinc-500 block mt-1">จากคำสั่งชำระเงินที่สำเร็จ</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-zinc-800 text-left relative overflow-hidden">
          <div className="flex justify-between items-center text-zinc-500 mb-2">
            <span className="text-3xs uppercase tracking-wider font-semibold">ปริมาณไฟฟ้าที่จ่ายรวม</span>
            <Zap size={18} className="text-emerald-400" />
          </div>
          <span className="text-2xl font-bold text-slate-100 font-mono">{totalEnergy.toFixed(1)} <span className="text-xs text-zinc-500">kWh</span></span>
          <span className="text-3xs text-zinc-500 block mt-1">พลังงานไฟฟ้าสะสมที่เติมให้รถ</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-zinc-800 text-left relative overflow-hidden">
          <div className="flex justify-between items-center text-zinc-500 mb-2">
            <span className="text-3xs uppercase tracking-wider font-semibold">กำลังชาร์จ (Charging)</span>
            <Activity size={18} className="text-blue-400" />
          </div>
          <span className="text-2xl font-bold text-blue-400 animate-pulse">{activeChargingCount} <span className="text-xs text-zinc-500">/ {totalConnectors}</span></span>
          <span className="text-3xs text-zinc-500 block mt-1">หัวชาร์จกำลังจ่ายกระแสไฟ</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-zinc-800 text-left relative overflow-hidden">
          <div className="flex justify-between items-center text-zinc-500 mb-2">
            <span className="text-3xs uppercase tracking-wider font-semibold">หัวชาร์จพร้อมใช้ (Available)</span>
            <CheckCircle2 size={18} className="text-emerald-400" />
          </div>
          <span className="text-2xl font-bold text-emerald-400">{availableCount}</span>
          <span className="text-3xs text-zinc-500 block mt-1">หัวชาร์จออนไลน์ว่างรอใช้</span>
        </div>
      </div>

      {/* Grid Dashboard content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Stations Live Status Monitor */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Zap size={18} className="text-emerald-400" />
            <span>สถานะและควบคุมสถานีชาร์จแบบ Real-Time</span>
          </h2>

          {isLoading ? (
            <div className="flex flex-col gap-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-32 w-full rounded-2xl bg-zinc-900/40 border border-zinc-800 shimmer"></div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {stations.map((station) => (
                <div key={station.id} className="glass-panel rounded-2xl p-5 border border-zinc-800/80">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-base text-slate-200">{station.name}</h3>
                      <p className="text-2xs text-zinc-500 mt-0.5">{station.location}</p>
                    </div>
                    <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-0.5 rounded-lg">
                      {station.id}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {station.connectors.map((c) => {
                      const key = `${station.id}-${c.id}`;
                      const isActing = isActioning === key;
                      
                      return (
                        <div key={c.id} className="p-3 rounded-xl bg-zinc-950 border border-zinc-900 flex flex-col justify-between gap-3 relative overflow-hidden">
                          {/* Colored status line */}
                          <div className={`absolute top-0 left-0 right-0 h-1 ${
                            c.status === "available" ? "bg-emerald-500" : c.status === "charging" ? "bg-blue-500" : c.status === "occupied" ? "bg-amber-500" : "bg-zinc-700"
                          }`}></div>

                          <div className="flex justify-between items-start pt-1">
                            <div>
                              <span className="text-3xs uppercase tracking-wider font-bold text-zinc-500">หัวชาร์จ {c.id}</span>
                              <div className="text-xs font-semibold text-slate-200">{c.type} ({c.power}kW)</div>
                            </div>
                            <span className={`text-3xs font-bold px-1.5 py-0.5 rounded ${
                              c.status === "available" 
                                ? "bg-emerald-500/15 text-emerald-400" 
                                : c.status === "charging" 
                                ? "bg-blue-500/15 text-blue-400 animate-pulse" 
                                : c.status === "occupied" 
                                ? "bg-amber-500/15 text-amber-400" 
                                : "bg-zinc-800 text-zinc-500"
                            }`}>
                              {c.status === "available" ? "ว่าง" : c.status === "charging" ? "ชาร์จอยู่" : c.status === "occupied" ? "ค้างจ่าย" : "offline"}
                            </span>
                          </div>

                          {/* Control overrides */}
                          <div>
                            {c.status === "charging" && (
                              <button
                                onClick={() => handleControlConnector(station.id, c.id, "force_stop")}
                                disabled={isActing}
                                className="w-full py-1.5 rounded-lg bg-rose-600/15 border border-rose-600/30 text-rose-400 hover:bg-rose-600/30 text-3xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                              >
                                <Power size={10} />
                                <span>{isActing ? "กำลังส่งคำสั่ง..." : "หยุดชาร์จด่วน (Force Stop)"}</span>
                              </button>
                            )}

                            {c.status === "occupied" && (
                              <button
                                onClick={() => handleControlConnector(station.id, c.id, "reset")}
                                disabled={isActing}
                                className="w-full py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 hover:bg-amber-500/30 text-3xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                              >
                                <RefreshCw size={10} />
                                <span>{isActing ? "กำลังส่งคำสั่ง..." : "รีเซ็ตหัวชาร์จ (Reset)"}</span>
                              </button>
                            )}

                            {c.status === "available" && (
                              <span className="text-3xs text-zinc-600 block text-center py-1">
                                เชื่อมต่อออนไลน์ปกติ
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Analytics Summary & Graphic Report */}
        <div className="flex flex-col gap-6">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Settings size={18} className="text-emerald-400" />
            <span>รายงานและยอดการใช้งาน</span>
          </h2>

          <div className="glass-panel rounded-2xl p-5 border border-zinc-800/80 flex flex-col gap-5">
            {/* Visual SVG Bar graph for trend */}
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-zinc-400 block mb-3">
                แนวโน้มปริมาณไฟฟ้าชาร์จรายวัน (kWh)
              </span>
              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-900">
                {/* SVG Graph */}
                <svg className="w-full h-32" viewBox="0 0 100 50">
                  {/* Grid lines */}
                  <line x1="0" y1="10" x2="100" y2="10" stroke="#1f2937" strokeWidth="0.2" strokeDasharray="1 1" />
                  <line x1="0" y1="25" x2="100" y2="25" stroke="#1f2937" strokeWidth="0.2" strokeDasharray="1 1" />
                  <line x1="0" y1="40" x2="100" y2="40" stroke="#1f2937" strokeWidth="0.2" strokeDasharray="1 1" />
                  
                  {/* Bars (Mon-Sun trend) */}
                  <rect x="5" y="15" width="8" height="30" rx="1" fill="#3b82f6" opacity="0.3" />
                  <rect x="18" y="20" width="8" height="25" rx="1" fill="#3b82f6" opacity="0.3" />
                  <rect x="31" y="8" width="8" height="37" rx="1" fill="#3b82f6" opacity="0.3" />
                  <rect x="44" y="12" width="8" height="33" rx="1" fill="#3b82f6" opacity="0.3" />
                  <rect x="57" y="18" width="8" height="27" rx="1" fill="#10b981" />
                  <rect x="70" y="5" width="8" height="40" rx="1" fill="#10b981" />
                  <rect x="83" y="10" width="8" height="35" rx="1" fill="#3b82f6" opacity="0.3" />

                  {/* Labels */}
                  <text x="9" y="48" fontSize="3" fill="#6b7280" textAnchor="middle">M</text>
                  <text x="22" y="48" fontSize="3" fill="#6b7280" textAnchor="middle">T</text>
                  <text x="35" y="48" fontSize="3" fill="#6b7280" textAnchor="middle">W</text>
                  <text x="48" y="48" fontSize="3" fill="#6b7280" textAnchor="middle">T</text>
                  <text x="61" y="48" fontSize="3" fill="#10b981" textAnchor="middle" fontWeight="bold">F (วันนี้)</text>
                  <text x="74" y="48" fontSize="3" fill="#6b7280" textAnchor="middle">S</text>
                  <text x="87" y="48" fontSize="3" fill="#6b7280" textAnchor="middle">S</text>
                </svg>
              </div>
            </div>

            {/* Simulated Live Terminal logs */}
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-zinc-400 block mb-2">
                Log คำสั่งเชื่อมต่อสถานี (OCPP Commands)
              </span>
              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-900 font-mono text-3xs text-slate-400 h-44 overflow-y-auto flex flex-col gap-1.5">
                <div>[10:51:02] OCPP-1.6J Server Initialized.</div>
                <div>[10:51:02] Station EV-BKK-001 connected. status: available</div>
                <div>[10:51:03] Station EV-BKK-002 connected. status: available</div>
                <div>[10:51:03] Station EV-CNX-001 connected. status: available</div>
                {stations.some(s => s.connectors.some(c => c.status === "occupied")) && (
                  <div className="text-amber-400 animate-pulse">[Live] Received OCPP: BootNotification: Connector Lock Reserved</div>
                )}
                {stations.some(s => s.connectors.some(c => c.status === "charging")) && (
                  <div className="text-blue-400 animate-pulse">[Live] OCPP Command sent: RemoteStartTransaction (Success)</div>
                )}
                {stations.every(s => s.connectors.every(c => c.status === "available")) && (
                  <div className="text-zinc-600">[Waiting for user transactions...]</div>
                )}
              </div>
            </div>

            {/* Instruction manual for the President */}
            <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-3xs text-zinc-400">
              <strong className="text-emerald-400 block mb-1">💡 คำแนะนำในการทดสอบสำหรับท่านประธาน:</strong>
              1. เปิดหน้าเว็บบนมือถือเพื่อทำรายการสแกนตู้และชาร์จไฟ<br />
              2. สังเกตหน้าแดชบอร์ดนี้จะอัปเดตสถิติและสถานะตู้ชาร์จเป็น "ชาร์จอยู่" หรือ "รอชำระเงิน" แบบ Real-Time ทันที<br />
              3. กดปุ่มหยุดชาร์จด่วนหรือรีเซ็ต เพื่อจำลองสั่งการระยะไกลจากฝั่งแอดมิน
            </div>
          </div>
        </div>
      </div>

      {/* Transaction History Table */}
      <div className="w-full flex flex-col gap-4">
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <Layers size={18} className="text-emerald-400" />
          <span>ประวัติธุรกรรมและการชาร์จไฟฟ้าในระบบ (Transaction Logs)</span>
        </h2>

        <div className="glass-panel rounded-2xl border border-zinc-800 overflow-hidden">
          <div className="overflow-x-auto w-full">
            <table className="min-w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-zinc-950/60 border-b border-zinc-800 text-zinc-500 uppercase tracking-widest text-3xs font-semibold">
                  <th className="py-3 px-4">ทะเบียนรถ</th>
                  <th className="py-3 px-4">หมายเลขรายการ</th>
                  <th className="py-3 px-4">ตู้ / หัวชาร์จ</th>
                  <th className="py-3 px-4">เป้าหมายชาร์จ</th>
                  <th className="py-3 px-4 text-right">ปริมาณไฟ</th>
                  <th className="py-3 px-4 text-right">ยอดเงิน</th>
                  <th className="py-3 px-4 text-center">สถานะธุรกรรม</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900 text-zinc-300">
                {sessions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-zinc-500 font-medium">
                      ไม่มีประวัติรายการชาร์จในขณะนี้ เริ่มต้นชาร์จผ่านตู้จำลองเพื่อสร้างประวัติการใช้งาน
                    </td>
                  </tr>
                ) : (
                  [...sessions].reverse().map((sess) => (
                    <tr key={sess.id} className="hover:bg-zinc-900/20 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-200">
                        {sess.carPlate || "-"}
                      </td>
                      <td className="py-3 px-4 font-mono text-zinc-400">
                        {sess.id}
                      </td>
                      <td className="py-3 px-4">
                        <span className="bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800 text-zinc-400 font-mono text-2xs mr-1.5">
                          {sess.chargerId}
                        </span>
                        <span className="text-zinc-500 font-mono text-2xs">
                          หัวชาร์จ {sess.connectorId}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium">
                        {sess.targetType === "full" && "ชาร์จเต็ม (100%)"}
                        {sess.targetType === "amount" && `ระบุเงิน ฿${sess.targetValue}`}
                        {sess.targetType === "kwh" && `ระบุหน่วย ${sess.targetValue} kWh`}
                        {sess.targetType === "duration" && `ระบุเวลา ${sess.targetValue} นาที`}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold">
                        {sess.energyDelivered.toFixed(2)} kWh
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                        ฿{sess.cost.toLocaleString("th-TH")}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block text-3xs font-bold px-2 py-0.5 rounded ${
                          sess.status === "completed" 
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25" 
                            : sess.status === "charging" 
                            ? "bg-blue-500/10 text-blue-400 border border-blue-500/25 animate-pulse" 
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/25"
                        }`}>
                          {sess.status === "completed" ? "ชาร์จเสร็จสิ้น" : sess.status === "charging" ? "กำลังชาร์จ..." : "รอชำระเงิน"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
