"use client";

import { AlertCircle, CheckCircle2, RefreshCw } from "lucide-react";
import { useAdminDashboard } from "@/hooks/use-admin-dashboard";
import { AdminKpiGrid } from "@/components/admin/admin-kpi-grid";
import { StationControlList } from "@/components/admin/station-control-list";
import { AnalyticsAndOcppPanel } from "@/components/admin/analytics-and-ocpp-panel";
import { TransactionHistoryTable } from "@/components/admin/transaction-history-table";

export default function AdminDashboardPage() {
  const {
    stations,
    sessions,
    metrics,
    isLoading,
    isActioning,
    error,
    successMsg,
    controlConnector,
    resetDatabase,
  } = useAdminDashboard();

  return (
    <div className="flex-1 max-w-5xl w-full mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-2xs text-cyan-400 font-bold uppercase tracking-wider">
            <span className="h-2 w-2 rounded-full bg-cyan-500 animate-pulse" />
            Live Admin Monitoring Control Panel
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight mt-1 text-slate-100 font-sans">
            แผงควบคุมระบบเครือข่าย EV Charger
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            ยินดีต้อนรับท่านประธาน (President) ติดตามสถานะรายได้ ปริมาณไฟฟ้า
            และควบคุมเครื่องชาร์จเรียบร้อยในหน้าจอเดียว
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={resetDatabase}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-zinc-300 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <RefreshCw size={14} />
            <span>รีเซ็ตค่าเริ่มต้นระบบ</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="mb-6 p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-sm flex items-center gap-2">
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

      <AdminKpiGrid metrics={metrics} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <StationControlList
          stations={stations}
          isLoading={isLoading}
          isActioning={isActioning}
          onControlConnector={controlConnector}
        />
        <AnalyticsAndOcppPanel stations={stations} />
      </div>

      <TransactionHistoryTable sessions={sessions} />
    </div>
  );
}
