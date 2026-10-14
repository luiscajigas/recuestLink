import Link from "next/link";
import { formatDateTime } from "@/lib/format";
import type { Ambulance, Emergency, EmergencyStatus } from "@/types/emergency";
import { AmbulanceAssigner } from "./AmbulanceAssigner";
import { PriorityBadge } from "./PriorityBadge";
import { StatusBadge } from "./StatusBadge";
import { StatusSelect } from "./StatusSelect";

interface EmergencyTableProps {
  emergencies: Emergency[];
  ambulances: Ambulance[];
  loading: boolean;
  onAssign: (emergencyId: string, ambulanceId: string) => void;
  onChangeStatus: (emergencyId: string, status: EmergencyStatus) => void;
}

const COLUMNS = ["Emergencia", "Ubicación", "Prioridad", "Estado", "Ambulancia", "Cambiar estado"];

export function EmergencyTable({ emergencies, ambulances, loading, onAssign, onChangeStatus }: EmergencyTableProps) {
  if (loading) {
    return <p className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">Cargando emergencias...</p>;
  }
  if (emergencies.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
        Aún no hay emergencias registradas.{" "}
        <Link href="/emergencias/nueva" className="font-medium text-blue-800 hover:underline">
          Registra la primera
        </Link>
        .
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="w-full min-w-[56rem] text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
          <tr>
            {COLUMNS.map((column) => (
              <th key={column} scope="col" className="px-4 py-3 font-medium">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {emergencies.map((emergency) => (
            <tr
              key={emergency.id}
              className={emergency.priority === "HIGH" && emergency.status !== "FINISHED" ? "bg-red-50" : undefined}
            >
              <td className="max-w-xs px-4 py-3 align-top">
                <p className="font-medium">
                  {emergency.id}
                  <span className="ml-2 text-xs font-normal text-slate-500">{formatDateTime(emergency.created_at)}</span>
                </p>
                <p className="text-slate-700">{emergency.description}</p>
              </td>
              <td className="px-4 py-3 align-top text-slate-700">{emergency.location}</td>
              <td className="px-4 py-3 align-top">
                <PriorityBadge priority={emergency.priority} />
              </td>
              <td className="px-4 py-3 align-top">
                <StatusBadge status={emergency.status} />
              </td>
              <td className="px-4 py-3 align-top">
                <AmbulanceAssigner emergency={emergency} ambulances={ambulances} onAssign={onAssign} />
              </td>
              <td className="px-4 py-3 align-top">
                <StatusSelect emergency={emergency} onChange={onChangeStatus} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
