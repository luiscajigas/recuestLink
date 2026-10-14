"use client";

import { useConnectionStatus } from "@/hooks/useConnectionStatus";
import type { ConnectionState } from "@/types/emergency";

const STATE_STYLES: Record<ConnectionState, { label: string; dot: string }> = {
  checking: { label: "Verificando conexión", dot: "bg-slate-400" },
  connected: { label: "Conectado a gRPC", dot: "bg-emerald-500" },
  grpc_down: { label: "Servidor gRPC sin respuesta", dot: "bg-amber-500" },
  offline: { label: "Sin conexión con el backend", dot: "bg-red-600" },
};

export function ConnectionStatus() {
  const { label, dot } = STATE_STYLES[useConnectionStatus()];

  return (
    <div className="flex items-center gap-2 text-sm text-slate-700" role="status">
      <span className={`h-2.5 w-2.5 rounded-full ${dot}`} aria-hidden />
      {label}
    </div>
  );
}
