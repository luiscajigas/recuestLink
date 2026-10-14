"use client";

import { useState } from "react";
import { ambulanceLabel } from "@/lib/format";
import type { Ambulance, Emergency } from "@/types/emergency";

interface AmbulanceAssignerProps {
  emergency: Emergency;
  ambulances: Ambulance[];
  onAssign: (emergencyId: string, ambulanceId: string) => void;
}

export function AmbulanceAssigner({ emergency, ambulances, onAssign }: AmbulanceAssignerProps) {
  const [selectedId, setSelectedId] = useState("");
  const available = ambulances.filter((ambulance) => ambulance.available);

  if (emergency.ambulance_id) {
    const assigned = ambulances.find((ambulance) => ambulance.id === emergency.ambulance_id);
    return <span className="text-sm">{assigned ? ambulanceLabel(assigned) : emergency.ambulance_id}</span>;
  }
  if (emergency.status === "FINISHED") {
    return <span className="text-sm text-slate-400">Sin ambulancia</span>;
  }
  if (available.length === 0) {
    return <span className="text-sm text-slate-500">Sin ambulancias disponibles</span>;
  }

  const currentId = available.some((ambulance) => ambulance.id === selectedId) ? selectedId : available[0].id;

  return (
    <div className="flex items-center gap-2">
      <select
        aria-label={`Ambulancia para ${emergency.id}`}
        value={currentId}
        onChange={(event) => setSelectedId(event.target.value)}
        className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm"
      >
        {available.map((ambulance) => (
          <option key={ambulance.id} value={ambulance.id}>
            {ambulanceLabel(ambulance)}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={() => onAssign(emergency.id, currentId)}
        className="rounded-lg bg-blue-950 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-900"
      >
        Asignar
      </button>
    </div>
  );
}
