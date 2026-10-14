import { Ambulance as AmbulanceIcon } from "lucide-react";
import type { Ambulance } from "@/types/emergency";

export function AmbulanceList({ ambulances }: { ambulances: Ambulance[] }) {
  return (
    <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
      {ambulances.map((ambulance) => (
        <li key={ambulance.id} className="flex items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <AmbulanceIcon className="h-5 w-5 text-blue-900" aria-hidden />
            <div>
              <p className="text-sm font-medium">{ambulance.id}</p>
              <p className="text-xs text-slate-500">{ambulance.name}</p>
            </div>
          </div>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
              ambulance.available ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700"
            }`}
          >
            {ambulance.available ? "Disponible" : "Ocupada"}
          </span>
        </li>
      ))}
    </ul>
  );
}
