"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { ChargingSession } from "@/lib/validations/charger.schema";
import {
  fetchSessionByIdApi,
  fetchStationsApi,
} from "@/lib/client/charger-api";
import { formatSimulatedDurationThai } from "@/lib/domain/charging-physics";

export interface ReceiptDetails {
  session: ChargingSession;
  stationName: string;
  connectorType: string;
  pricePerKwh: number;
  durationLabel: string;
}

export function useReceipt(sessionId: string) {
  const router = useRouter();
  const [details, setDetails] = useState<ReceiptDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function fetchReceiptDetails() {
      try {
        const sessionRes = await fetchSessionByIdApi(sessionId);
        if (!active) return;
        if (!sessionRes.ok) {
          setError("ไม่สามารถดึงข้อมูลประวัติการชาร์จได้");
          return;
        }

        const session = sessionRes.data;
        let stationName = "";
        let connectorType = "";
        let pricePerKwh = 0;

        const stationsRes = await fetchStationsApi();
        if (!active) return;
        if (stationsRes.ok) {
          const station = stationsRes.data.stations.find(
            (s) => s.id === session.chargerId
          );
          if (station) {
            stationName = station.name;
            const connector = station.connectors.find(
              (c) => c.id === session.connectorId
            );
            if (connector) {
              connectorType = connector.type;
              pricePerKwh = connector.pricePerKwh;
            }
          }
        }

        const durationLabel =
          session.startTime && session.endTime
            ? formatSimulatedDurationThai(session.startTime, session.endTime)
            : "-";

        setDetails({
          session,
          stationName,
          connectorType,
          pricePerKwh,
          durationLabel,
        });
      } catch {
        if (active) setError("เกิดความผิดพลาดในการเรียกดูข้อมูล");
      } finally {
        if (active) setIsLoading(false);
      }
    }

    void fetchReceiptDetails();
    return () => {
      active = false;
    };
  }, [sessionId]);

  return {
    details,
    isLoading,
    error,
    goHome: () => router.push("/"),
  };
}
