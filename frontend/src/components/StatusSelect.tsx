import { STATUS_LABELS, STATUS_ORDER } from "@/lib/format";
import type { Emergency, EmergencyStatus } from "@/types/emergency";

interface StatusSelectProps {
  emergency: Emergency;
  onChange: (emergencyId: string, status: EmergencyStatus) => void;
}

export function StatusSelect({ emergency, onChange }: StatusSelectProps) {
  return (
    <select
      aria-label={`Cambiar estado de ${emergency.id}`}
      value={emergency.status}
      disabled={emergency.status === "FINISHED"}
      onChange={(event) => onChange(emergency.id, event.target.value as EmergencyStatus)}
      className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm disabled:bg-slate-100 disabled:text-slate-400"
    >
      {STATUS_ORDER.map((status) => (
        <option key={status} value={status}>
          {STATUS_LABELS[status]}
        </option>
      ))}
    </select>
  );
}
