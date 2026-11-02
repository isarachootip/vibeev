"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  ChargerControlAction,
  ChargingSession,
  ChargingStation,
} from "@/lib/validations/charger.schema";
import type { IssueTicket } from "@/lib/validations/ticket.schema";
import {
  fetchStationsApi,
  postChargerControlApi,
  resetDatabaseApi,
} from "@/lib/client/charger-api";
import { resolveIssueTicketApi } from "@/lib/client/ticket-api";
import { calculateDashboardMetrics } from "@/lib/domain/dashboard-metrics";

export function useAdminDashboard() {
  const [stations, setStations] = useState<ChargingStation[]>([]);
  const [sessions, setSessions] = useState<ChargingSession[]>([]);
  const [tickets, setTickets] = useState<IssueTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActioning, setIsActioning] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const refreshNow = useCallback(async () => {
    try {
      const res = await fetchStationsApi();
      if (res.ok) {
        setStations(res.data.stations);
        setSessions(res.data.sessions);
        setTickets(res.data.tickets);
      } else {
        setError("เกิดปัญหาดึงข้อมูลแดชบอร์ด");
      }
    } catch {
      setError("เกิดปัญหาดึงข้อมูลแดชบอร์ด");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    const poll = () => {
      fetchStationsApi()
        .then((res) => {
          if (!active) return;
          if (res.ok) {
            setStations(res.data.stations);
            setSessions(res.data.sessions);
            setTickets(res.data.tickets);
          } else {
            setError("เกิดปัญหาดึงข้อมูลแดชบอร์ด");
          }
        })
        .catch(() => {
          if (active) setError("เกิดปัญหาดึงข้อมูลแดชบอร์ด");
        })
        .finally(() => {
          if (active) setIsLoading(false);
        });
    };

    poll();
    const interval = setInterval(poll, 2000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  const controlConnector = async (
    chargerId: string,
    connectorId: string,
    action: ChargerControlAction
  ) => {
    setIsActioning(`${chargerId}-${connectorId}`);
    setError("");
    setSuccessMsg("");

    try {
      const res = await postChargerControlApi({
        chargerId,
        connectorId,
        action,
      });
      if (res.ok) {
        const actionLabel =
          action === "force_stop"
            ? "หยุดชาร์จ"
            : action === "set_online"
            ? "เปิดหัวชาร์จออนไลน์"
            : "รีเซ็ตหัวชาร์จ";
        setSuccessMsg(`ส่งคำสั่ง ${actionLabel} สำเร็จ`);
        await refreshNow();
      } else {
        setError(res.error);
      }
    } catch {
      setError("เกิดปัญหาการส่งคำสั่งเชื่อมต่อสถานี");
    } finally {
      setIsActioning(null);
      setTimeout(() => setSuccessMsg(""), 3000);
    }
  };

  const resolveTicket = async (ticketId: string) => {
    setIsActioning(`ticket-${ticketId}`);
    setError("");
    setSuccessMsg("");

    try {
      const res = await resolveIssueTicketApi(ticketId, {
        bringConnectorOnline: true,
        resolutionNote:
          "ทีมวิศวกรตรวจสอบและเปิดใช้งานหัวชาร์จตามปกติเรียบร้อยแล้ว",
      });
      if (res.ok) {
        setSuccessMsg(
          `แก้ไขเคส #${ticketId} สำเร็จ และส่งข้อความแจ้งกลับทาง LINE OA แล้ว`
        );
        await refreshNow();
      } else {
        setError(res.error);
      }
    } catch {
      setError("เกิดข้อผิดพลาดในการปิดงานซ่อม");
    } finally {
      setIsActioning(null);
      setTimeout(() => setSuccessMsg(""), 3000);
    }
  };

  const resetDatabase = async () => {
    if (
      !window.confirm(
        "ท่านประธานต้องการล้างข้อมูลประวัติและรีเซ็ตตู้ชาร์จกลับเป็นค่าเริ่มต้นทั้งหมดหรือไม่?"
      )
    ) {
      return;
    }
    setIsLoading(true);
    try {
      const res = await resetDatabaseApi();
      if (res.ok) {
        setSuccessMsg("รีเซ็ตระบบทั้งหมดเรียบร้อยแล้ว");
        await refreshNow();
      } else {
        setError("ไม่สามารถรีเซ็ตฐานข้อมูลได้");
      }
    } catch {
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อเพื่อรีเซ็ต");
    } finally {
      setIsLoading(false);
      setTimeout(() => setSuccessMsg(""), 3000);
    }
  };

  const metrics = useMemo(
    () => calculateDashboardMetrics(stations, sessions),
    [stations, sessions]
  );

  return {
    stations,
    sessions,
    tickets,
    metrics,
    isLoading,
    isActioning,
    error,
    successMsg,
    controlConnector,
    resolveTicket,
    resetDatabase,
  };
}
