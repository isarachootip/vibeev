"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { ChargingSession } from "@/lib/validations/charger.schema";
import {
  fetchSessionByIdApi,
  postSessionActionApi,
} from "@/lib/client/charger-api";
import { formatSimulatedElapsedClock } from "@/lib/domain/charging-physics";

export function useChargingSession(sessionId: string) {
  const router = useRouter();
  const [session, setSession] = useState<ChargingSession | null>(null);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [isLoading, setIsLoading] = useState(true);
  const [isStopping, setIsStopping] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const runPoll = () => {
      fetchSessionByIdApi(sessionId)
        .then((res) => {
          if (!active) return;
          if (res.ok) {
            setSession(res.data);
            setIsLoading(false);
            if (res.data.status === "completed") {
              router.push(`/receipt/${sessionId}`);
            }
          } else {
            setError("ไม่สามารถดึงข้อมูลการชาร์จได้");
            setIsLoading(false);
          }
        })
        .catch(() => {
          if (!active) return;
          setError("เกิดปัญหาการเชื่อมต่อเครือข่าย");
          setIsLoading(false);
        });
    };

    runPoll();
    const interval = setInterval(runPoll, 1500);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [router, sessionId]);

  useEffect(() => {
    if (!session || session.status !== "charging" || !session.startTime) return;
    const timer = setInterval(() => {
      setNowMs(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, [session]);

  const elapsedTime =
    session && session.status === "charging" && session.startTime
      ? formatSimulatedElapsedClock(session.startTime, new Date(nowMs))
      : "00:00";

  const stopCharging = async () => {
    if (isStopping) return;
    setIsStopping(true);
    try {
      const res = await postSessionActionApi(sessionId, "stop_charging");
      if (res.ok) {
        router.push(`/receipt/${sessionId}`);
      } else {
        setError(`ไม่สามารถหยุดการชาร์จได้: ${res.error}`);
        setIsStopping(false);
      }
    } catch {
      setError("เกิดข้อผิดพลาดในการส่งคำสั่งหยุดชาร์จ");
      setIsStopping(false);
    }
  };

  return {
    session,
    elapsedTime,
    isLoading,
    isStopping,
    error,
    stopCharging,
    goHome: () => router.push("/"),
  };
}
