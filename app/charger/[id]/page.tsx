"use client";

import { use } from "react";
import { ArrowLeft, CreditCard, Info, MapPin, Zap } from "lucide-react";
import { useChargerCheckout } from "@/hooks/use-charger-checkout";
import { ConnectorSelector } from "@/components/charger/connector-selector";
import { ChargingTargetPicker } from "@/components/charger/charging-target-picker";
import { PromptPayModal } from "@/components/charger/promptpay-modal";
import { LineIssueTrigger } from "@/components/support/line-issue-trigger";

interface ChargerPageProps {
  params: Promise<{ id: string }>;
}

export default function ChargerPage({ params }: ChargerPageProps) {
  const { id } = use(params);
  const {
    station,
    selectedConnectorId,
    setSelectedConnectorId,
    targetType,
    selectTargetType,
    targetValue,
    setTargetValue,
    carPlate,
    setCarPlate,
    isLoading,
    isSubmitting,
    error,
    paymentSession,
    showPaymentModal,
    startPaymentProcess,
    confirmPayment,
    cancelPaymentModal,
    reloadStation,
    goHome,
  } = useChargerCheckout(id);

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center p-8 max-w-md mx-auto w-full">
        <div className="h-10 w-10 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mb-4" />
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
        <button
          type="button"
          onClick={goHome}
          className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-semibold cursor-pointer"
        >
          กลับหน้าหลัก
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col justify-start items-center px-4 py-6 max-w-md mx-auto w-full relative">
      <div className="w-full flex items-center justify-between mb-6">
        <button
          type="button"
          onClick={goHome}
          className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-slate-100 transition-all cursor-pointer"
        >
          <ArrowLeft size={16} />
        </button>
        <span className="font-mono text-xs font-bold text-zinc-500">
          ID: {id}
        </span>
        <div className="w-8" />
      </div>

      {station && (
        <>
          <div className="w-full mb-6">
            <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <Zap size={20} className="text-cyan-400 shrink-0" />
              <span>{station.name}</span>
            </h1>
            <p className="text-xs text-zinc-400 mt-1 flex items-start gap-1">
              <MapPin size={12} className="shrink-0 mt-0.5" />
              <span>{station.location}</span>
            </p>
          </div>

          <ConnectorSelector
            connectors={station.connectors}
            selectedConnectorId={selectedConnectorId}
            onSelectConnector={setSelectedConnectorId}
          />

          <ChargingTargetPicker
            targetType={targetType}
            targetValue={targetValue}
            onSelectTargetType={selectTargetType}
            onTargetValueChange={setTargetValue}
          />

          <div className="w-full mb-6">
            <span className="text-xs uppercase tracking-wider font-semibold text-zinc-400 block mb-3 px-1">
              3. ข้อมูลรถยนต์ไฟฟ้า
            </span>
            <input
              type="text"
              placeholder="กรอกทะเบียนรถยนต์ (เช่น 3กข-9999 กทม.)"
              value={carPlate}
              onChange={(e) => setCarPlate(e.target.value)}
              className="w-full py-3 px-4 rounded-xl bg-zinc-950 border border-zinc-800 focus:border-cyan-500 outline-none text-slate-100 transition-all placeholder:text-zinc-600 text-sm"
            />
          </div>

          {error && (
            <div className="w-full p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs mb-4">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={startPaymentProcess}
            disabled={isSubmitting || !selectedConnectorId}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 font-bold text-black flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-cyan-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CreditCard size={18} />
            <span>ชำระเงินและเริ่มชาร์จ</span>
          </button>

          <LineIssueTrigger
            chargerId={id}
            connectorId={selectedConnectorId || undefined}
            buttonLabel="พบปัญหาที่ตู้ชาร์จ? แจ้งด่วนผ่าน LINE OA"
            onReported={() => void reloadStation()}
          />
        </>
      )}

      {showPaymentModal && paymentSession && (
        <PromptPayModal
          targetType={targetType}
          targetValue={targetValue}
          isSubmitting={isSubmitting}
          onConfirmPayment={confirmPayment}
          onCancel={cancelPaymentModal}
        />
      )}
    </div>
  );
}
