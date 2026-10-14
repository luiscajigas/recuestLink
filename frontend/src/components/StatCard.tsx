import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
}

export function StatCard({ label, value, icon: Icon }: StatCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5">
      <div className="rounded-lg bg-blue-50 p-3 text-blue-900">
        <Icon className="h-6 w-6" aria-hidden />
      </div>
      <div>
        <p className="text-sm text-slate-600">{label}</p>
        <p className="text-2xl font-semibold text-blue-950">{value}</p>
      </div>
    </div>
  );
}
