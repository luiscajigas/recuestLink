import { STATUS_LABELS } from "@/lib/format";
import type { EmergencyStatus } from "@/types/emergency";

const STATUS_STYLES: Record<EmergencyStatus, string> = {
  REPORTED: "bg-amber-100 text-amber-800",
  EN_ROUTE: "bg-blue-100 text-blue-800",
  IN_CARE: "bg-indigo-100 text-indigo-800",
  FINISHED: "bg-emerald-100 text-emerald-800",
};

export function StatusBadge({ status }: { status: EmergencyStatus }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}
