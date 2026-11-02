"use client";

import { use } from "react";
import { StopCircle } from "lucide-react";
import { useChargingSession } from "@/hooks/use-charging-session";
import { SocCircularGauge } from "@/components/charging/soc-circular-gauge";
import { TelemetryCards } from "@/components/charging/telemetry-cards";
import { LineIssueTrigger } from "@/components/support/line-issue-trigger";

interface ChargingPageProps {
  params: Promise<{ sessionId: string }>;
}

export default function ChargingPage({ params }: ChargingPageProps) {
  const { sessionId } = use(params);
  const {
    session,
    elapsedTime,
    isLoading,
    isStopping,
    error,
    stopCharging,
    goHome,
  } = useChargingSession(sessionId);

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center p-8 max-w-md mx-auto w-full">
        <div className="h-10 w-10 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mb-4" />
        <p className="text-sm text-zinc-400">
          กำลังเชื่อมต่อกับระบบควบคุมเครื่องชาร์จ...
        </p>
      </div>
    );
  }

  if (error && !session) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center p-8 max-w-md mx-auto w-full text-center">
        <p className="text-rose-400 mb-4">{error}</p>
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
    <div className="flex-1 flex flex-col justify-start items-center px-4 py-6 max-w-md mx-auto w-full">
      <div className="w-full flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500" />
          </span>
          <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
            กำลังจ่ายกระแสไฟ...
          </span>
        </div>
        <span className="font-mono text-2xs text-zinc-500">
          Session: {sessionId}
        </span>
      </div>

      {session && (
        <>
          <SocCircularGauge soc={session.soc} powerKW={session.powerKW} />
          <TelemetryCards session={session} elapsedTime={elapsedTime} />

          <div className="w-full text-center text-3xs text-zinc-500 mb-6 bg-zinc-950 p-3 rounded-lg border border-zinc-900">
            * ระบบทำการจำลองเวลาและปริมาณไฟฟ้าเร่งสปีดขึ้น 30 เท่า
            เพื่อความสะดวกรวดเร็วในการทดสอบสาธิตระบบ
          </div>

          {error && (
            <div className="w-full p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs mb-4">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={stopCharging}
            disabled={isStopping}
            className="w-full py-4 rounded-xl bg-rose-600/20 border border-rose-600/40 text-rose-400 hover:bg-rose-600/30 hover:border-rose-600/60 font-bold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {isStopping ? (
              <span className="h-4 w-4 border-2 border-rose-500/20 border-t-rose-500 rounded-full animate-spin" />
            ) : (
              <StopCircle size={18} />
            )}
            <span>สั่งหยุดชาร์จทันที (Stop)</span>
          </button>

          <LineIssueTrigger
            chargerId={session.chargerId}
            connectorId={session.connectorId}
            sessionId={session.id}
            buttonLabel="แจ้งเหตุฉุกเฉิน / ถอดสายไม่ออกผ่าน LINE OA"
          />
        </>
      )}
    </div>
  );
}
