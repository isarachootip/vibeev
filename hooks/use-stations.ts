"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { ChargingStation } from "@/lib/validations/charger.schema";
import { fetchStationsApi } from "@/lib/client/charger-api";

export function useStations() {
  const router = useRouter();
  const [stations, setStations] = useState<ChargingStation[]>([]);
  const [chargerIdInput, setChargerIdInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetchStationsApi()
      .then((result) => {
        if (!active) return;
        if (result.ok) {
          setStations(result.data.stations);
        } else {
          setError("ไม่สามารถดึงข้อมูลสถานีชาร์จได้");
        }
      })
      .catch(() => {
        if (active) setError("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const fetchStations = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await fetchStationsApi();
      if (result.ok) {
        setStations(result.data.stations);
      } else {
        setError("ไม่สามารถดึงข้อมูลสถานีชาร์จได้");
      }
    } catch {
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleInputChange = (value: string) => {
    setChargerIdInput(value);
    setError("");
  };

  const submitChargerCode = () => {
    if (!chargerIdInput.trim()) return;
    const targetId = chargerIdInput.trim().toUpperCase();
    const exists = stations.some((s) => s.id === targetId);
    if (exists) {
      router.push(`/charger/${targetId}`);
    } else {
      setError(
        "ไม่พบรหัสเครื่องชาร์จนี้ในระบบ กรุณาลองใหม่อีกครั้ง (เช่น EV-BKK-001)"
      );
    }
  };

  return {
    stations,
    chargerIdInput,
    isLoading,
    error,
    fetchStations,
    handleInputChange,
    submitChargerCode,
    navigateToStation: (stationId: string) =>
      router.push(`/charger/${stationId}`),
  };
}
