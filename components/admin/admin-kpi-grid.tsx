"use client";

import { Activity, CheckCircle2, DollarSign, Zap } from "lucide-react";
import type { DashboardMetrics } from "@/lib/domain/dashboard-metrics";

interface AdminKpiGridProps {
  metrics: DashboardMetrics;
}

export function AdminKpiGrid({ metrics }: AdminKpiGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div className="glass-panel p-5 rounded-2xl border border-zinc-800 text-left relative overflow-hidden">
        <div className="flex justify-between items-center text-zinc-500 mb-2">
          <span className="text-3xs uppercase tracking-wider font-semibold">
            รายได้รวมสะสม
          </span>
          <DollarSign size={18} className="text-cyan-400" />
        </div>
        <span className="text-2xl font-bold text-cyan-400 font-mono">
          ฿{metrics.totalRevenue.toLocaleString("th-TH")}
        </span>
        <span className="text-3xs text-zinc-500 block mt-1">
          จากคำสั่งชำระเงินที่สำเร็จ
        </span>
      </div>

      <div className="glass-panel p-5 rounded-2xl border border-zinc-800 text-left relative overflow-hidden">
        <div className="flex justify-between items-center text-zinc-500 mb-2">
          <span className="text-3xs uppercase tracking-wider font-semibold">
            ปริมาณไฟฟ้าที่จ่ายรวม
          </span>
          <Zap size={18} className="text-cyan-400" />
        </div>
        <span className="text-2xl font-bold text-slate-100 font-mono">
          {metrics.totalEnergy.toFixed(1)}{" "}
          <span className="text-xs text-zinc-500">kWh</span>
        </span>
        <span className="text-3xs text-zinc-500 block mt-1">
          พลังงานไฟฟ้าสะสมที่เติมให้รถ
        </span>
      </div>

      <div className="glass-panel p-5 rounded-2xl border border-zinc-800 text-left relative overflow-hidden">
        <div className="flex justify-between items-center text-zinc-500 mb-2">
          <span className="text-3xs uppercase tracking-wider font-semibold">
            กำลังชาร์จ (Charging)
          </span>
          <Activity size={18} className="text-blue-400" />
        </div>
        <span className="text-2xl font-bold text-blue-400 animate-pulse">
          {metrics.activeChargingCount}{" "}
          <span className="text-xs text-zinc-500">
            / {metrics.totalConnectors}
          </span>
        </span>
        <span className="text-3xs text-zinc-500 block mt-1">
          หัวชาร์จกำลังจ่ายกระแสไฟ
        </span>
      </div>

      <div className="glass-panel p-5 rounded-2xl border border-zinc-800 text-left relative overflow-hidden">
        <div className="flex justify-between items-center text-zinc-500 mb-2">
          <span className="text-3xs uppercase tracking-wider font-semibold">
            หัวชาร์จพร้อมใช้ (Available)
          </span>
          <CheckCircle2 size={18} className="text-cyan-400" />
        </div>
        <span className="text-2xl font-bold text-cyan-400">
          {metrics.availableCount}
        </span>
        <span className="text-3xs text-zinc-500 block mt-1">
          หัวชาร์จออนไลน์ว่างรอใช้
        </span>
      </div>
    </div>
  );
}
