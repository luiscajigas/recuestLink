import type { Ambulance, EmergencyStatus, Priority } from "@/types/emergency";

export const PRIORITY_LABELS: Record<Priority, string> = {
  LOW: "Baja",
  MEDIUM: "Media",
  HIGH: "Alta",
};
export const PRIORITY_ORDER: Priority[] = ["LOW", "MEDIUM", "HIGH"];

export const STATUS_LABELS: Record<EmergencyStatus, string> = {
  REPORTED: "Reportada",
  EN_ROUTE: "En camino",
  IN_CARE: "En atención",
  FINISHED: "Finalizada",
};
export const STATUS_ORDER: EmergencyStatus[] = ["REPORTED", "EN_ROUTE", "IN_CARE", "FINISHED"];

export function formatDateTime(isoDate: string): string {
  return new Date(isoDate).toLocaleString("es-CO", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ambulanceLabel(ambulance: Ambulance): string {
  return `${ambulance.id} (${ambulance.name})`;
}
