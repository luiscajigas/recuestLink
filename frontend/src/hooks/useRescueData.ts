"use client";

import { useCallback, useEffect, useState } from "react";
import {
  assignAmbulance,
  getAmbulances,
  getEmergencies,
  getErrorMessage,
  updateEmergencyStatus,
} from "@/services/api";
import type { Ambulance, Emergency, EmergencyStatus } from "@/types/emergency";

const POLL_INTERVAL_MS = 5000;

/** Carga emergencias y ambulancias, las refresca cada 5 s y expone las acciones. */
export function useRescueData() {
  const [emergencies, setEmergencies] = useState<Emergency[]>([]);
  const [ambulances, setAmbulances] = useState<Ambulance[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const [emergencyList, ambulanceList] = await Promise.all([getEmergencies(), getAmbulances()]);
      setEmergencies(emergencyList);
      setAmbulances(ambulanceList);
      setLoadError(null);
    } catch (error) {
      setLoadError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [refresh]);

  const runAction = useCallback(
    async (action: () => Promise<unknown>) => {
      setActionError(null);
      try {
        await action();
        await refresh();
      } catch (error) {
        setActionError(getErrorMessage(error));
      }
    },
    [refresh],
  );

  return {
    emergencies,
    ambulances,
    loading,
    error: actionError ?? loadError,
    assign: (emergencyId: string, ambulanceId: string) =>
      runAction(() => assignAmbulance(emergencyId, ambulanceId)),
    changeStatus: (emergencyId: string, status: EmergencyStatus) =>
      runAction(() => updateEmergencyStatus(emergencyId, status)),
  };
}
