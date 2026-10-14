"use client";

import Link from "next/link";
import { EmergencyTable } from "@/components/EmergencyTable";
import { ErrorBanner } from "@/components/ErrorBanner";
import { useRescueData } from "@/hooks/useRescueData";

export default function EmergenciesPage() {
  const { emergencies, ambulances, loading, error, assign, changeStatus } = useRescueData();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-blue-950">Emergencias</h1>
        <Link
          href="/emergencias/nueva"
          className="rounded-lg bg-blue-950 px-4 py-2 text-sm font-medium text-white hover:bg-blue-900"
        >
          Registrar emergencia
        </Link>
      </div>
      {error && <ErrorBanner message={error} />}
      <EmergencyTable
        emergencies={emergencies}
        ambulances={ambulances}
        loading={loading}
        onAssign={assign}
        onChangeStatus={changeStatus}
      />
    </div>
  );
}
