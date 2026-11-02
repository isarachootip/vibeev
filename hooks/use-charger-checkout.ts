"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type {
  ChargingSession,
  ChargingStation,
  TargetType,
} from "@/lib/validations/charger.schema";
import {
  createPaymentSessionApi,
  fetchStationsApi,
  postSessionActionApi,
} from "@/lib/client/charger-api";

const DEFAULT_TARGET_VALUES: Record<TargetType, string> = {
  full: "100",
  amount: "300",
  kwh: "30",
  duration: "30",
};

export function useChargerCheckout(stationId: string) {
  const router = useRouter();
  const [station, setStation] = useState<ChargingStation | null>(null);
  const [selectedConnectorId, setSelectedConnectorId] = useState("");
  const [targetType, setTargetType] = useState<TargetType>("full");
  const [targetValue, setTargetValue] = useState("100");
  const [carPlate, setCarPlate] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [paymentSession, setPaymentSession] = useState<ChargingSession | null>(
    null
  );
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const applyStationsPayload = useCallback(
    (stations: ChargingStation[]) => {
      const found = stations.find((s) => s.id === stationId);
      if (!found) {
        setError("ไม่พบรหัสเครื่องชาร์จนี้ในระบบ");
        return;
      }
      setStation(found);
      const firstAvail = found.connectors.find((c) => c.status === "available");
      if (firstAvail) {
        setSelectedConnectorId(firstAvail.id);
      }
    },
    [stationId]
  );

  useEffect(() => {
    let active = true;
    fetchStationsApi()
      .then((res) => {
        if (!active) return;
        if (!res.ok) {
          setError("ไม่สามารถดึงข้อมูลได้");
          return;
        }
        applyStationsPayload(res.data.stations);
      })
      .catch(() => {
        if (active) setError("การเชื่อมต่อมีปัญหา");
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [applyStationsPayload]);

  const reloadStation = async () => {
    const res = await fetchStationsApi();
    if (res.ok) {
      applyStationsPayload(res.data.stations);
    }
  };

  const selectTargetType = (nextType: TargetType) => {
    setTargetType(nextType);
    setTargetValue(DEFAULT_TARGET_VALUES[nextType]);
  };

  const startPaymentProcess = async () => {
    if (!selectedConnectorId) {
      setError("กรุณาเลือกหัวชาร์จ");
      return;
    }
    const conn = station?.connectors.find((c) => c.id === selectedConnectorId);
    if (!conn || conn.status !== "available") {
      setError("หัวชาร์จนี้ไม่ว่างในขณะนี้ กรุณาเลือกหัวชาร์จอื่น");
      return;
    }
    const parsedTarget = Number(targetValue);
    if (!Number.isFinite(parsedTarget) || parsedTarget <= 0) {
      setError("กรุณาระบุปริมาณการชาร์จที่มากกว่า 0");
      return;
    }

    setIsSubmitting(true);
    setError("");
    try {
      const res = await createPaymentSessionApi({
        chargerId: stationId,
        connectorId: selectedConnectorId,
        targetType,
        targetValue: parsedTarget,
        carPlate: carPlate.trim() || "กข-9999",
      });
      if (res.ok) {
        setPaymentSession(res.data);
        setShowPaymentModal(true);
      } else {
        setError(res.error);
      }
    } catch {
      setError("เกิดข้อผิดพลาดระหว่างส่งข้อมูล");
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmPayment = async () => {
    if (!paymentSession) return;
    setIsSubmitting(true);
    try {
      const res = await postSessionActionApi(
        paymentSession.id,
        "confirm_payment"
      );
      if (res.ok) {
        setShowPaymentModal(false);
        router.push(`/charging/${paymentSession.id}`);
      } else {
        setError(`การชำระเงินขัดข้อง: ${res.error}`);
      }
    } catch {
      setError("เกิดปัญหาการจำลองการจ่ายเงิน");
    } finally {
      setIsSubmitting(false);
    }
  };

  const cancelPaymentModal = async () => {
    const activePayment = paymentSession;
    setShowPaymentModal(false);
    setPaymentSession(null);
    if (!activePayment) return;
    try {
      await postSessionActionApi(activePayment.id, "cancel_payment");
      await reloadStation();
    } catch {
      // Non-fatal UI cleanup
    }
  };

  return {
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
    goHome: () => router.push("/"),
  };
}
