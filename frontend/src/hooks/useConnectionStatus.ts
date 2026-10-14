"use client";

import { useEffect, useState } from "react";
import { getHealth } from "@/services/api";
import type { ConnectionState } from "@/types/emergency";

const CHECK_INTERVAL_MS = 10000;

/** Consulta periódicamente si el gateway y el servidor gRPC responden. */
export function useConnectionStatus(): ConnectionState {
  const [state, setState] = useState<ConnectionState>("checking");

  useEffect(() => {
    let active = true;

    async function check() {
      try {
        const health = await getHealth();
        if (active) setState(health.grpc === "ok" ? "connected" : "grpc_down");
      } catch {
        if (active) setState("offline");
      }
    }

    check();
    const timer = setInterval(check, CHECK_INTERVAL_MS);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  return state;
}
