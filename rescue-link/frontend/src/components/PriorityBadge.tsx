import { PRIORITY_LABELS } from "@/lib/format";
import type { Priority } from "@/types/emergency";

const PRIORITY_STYLES: Record<Priority, string> = {
  LOW: "bg-slate-200 text-slate-700",
  MEDIUM: "bg-blue-100 text-blue-900",
  HIGH: "bg-red-600 text-white",
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${PRIORITY_STYLES[priority]}`}>
      {PRIORITY_LABELS[priority]}
    </span>
  );
}
