"use client";

import { Ambulance as AmbulanceIcon, ClipboardList, Siren } from "lucide-react";
import Link from "next/link";
import { AmbulanceList } from "@/components/AmbulanceList";
import { EmergencyTable } from "@/components/EmergencyTable";
import { ErrorBanner } from "@/components/ErrorBanner";
import { StatCard } from "@/components/StatCard";
import { useRescueData } from "@/hooks/useRescueData";

const RECENT_EMERGENCIES_COUNT = 5;

export default function DashboardPage() {
  const { emergencies, ambulances, loading, error, assign, changeStatus } = useRescueData();
  const activeCount = emergencies.filter((emergency) => emergency.status !== "FINISHED").length;
  const availableCount = ambulances.filter((ambulance) => ambulance.available).length;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-blue-950">Panel de control</h1>
      {error && <ErrorBanner message={error} />}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total de emergencias" value={emergencies.length} icon={ClipboardList} />
        <StatCard label="Emergencias activas" value={activeCount} icon={Siren} />
        <StatCard
          label="Ambulancias disponibles"
          value={`${availableCount} de ${ambulances.length}`}
          icon={AmbulanceIcon}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_20rem]">
        <section className="min-w-0 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-blue-950">Últimas emergencias</h2>
            <Link href="/emergencias" className="text-sm font-medium text-blue-800 hover:underline">
              Ver todas
            </Link>
          </div>
          <EmergencyTable
            emergencies={emergencies.slice(0, RECENT_EMERGENCIES_COUNT)}
            ambulances={ambulances}
            loading={loading}
            onAssign={assign}
            onChangeStatus={changeStatus}
          />
        </section>
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-blue-950">Ambulancias</h2>
          <AmbulanceList ambulances={ambulances} />
        </section>
      </div>
    </div>
  );
}
