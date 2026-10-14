import type {
  Ambulance,
  Emergency,
  EmergencyStatus,
  HealthResponse,
  NewEmergency,
} from "@/types/emergency";

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "https://rescuelink-api.onrender.com").replace(/\/$/, "");

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

async function readErrorDetail(response: Response): Promise<string> {
  try {
    const body = await response.json();
    if (typeof body.detail === "string") return body.detail;
    if (Array.isArray(body.detail) && body.detail[0]?.msg) {
      return `Datos inválidos: ${body.detail[0].msg}`;
    }
  } catch {
    // La respuesta no era JSON; se usa el mensaje genérico.
  }
  return `Error del servidor (${response.status}).`;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...init?.headers },
      cache: "no-store",
    });
  } catch {
    throw new ApiError("No se pudo conectar con el servidor. Verifica que el backend esté en ejecución.", 0);
  }
  if (!response.ok) {
    throw new ApiError(await readErrorDetail(response), response.status);
  }
  return (await response.json()) as T;
}

export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Ocurrió un error inesperado.";
}

export const getHealth = () => request<HealthResponse>("/api/health");
export const getEmergencies = () => request<Emergency[]>("/api/emergencies");
export const getAmbulances = () => request<Ambulance[]>("/api/ambulances");

export const createEmergency = (data: NewEmergency) =>
  request<Emergency>("/api/emergencies", { method: "POST", body: JSON.stringify(data) });

export const assignAmbulance = (emergencyId: string, ambulanceId: string) =>
  request<Emergency>(`/api/emergencies/${emergencyId}/assign`, {
    method: "POST",
    body: JSON.stringify({ ambulance_id: ambulanceId }),
  });

export const updateEmergencyStatus = (emergencyId: string, status: EmergencyStatus) =>
  request<Emergency>(`/api/emergencies/${emergencyId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
