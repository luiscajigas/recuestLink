export type Priority = "LOW" | "MEDIUM" | "HIGH";
export type EmergencyStatus = "REPORTED" | "EN_ROUTE" | "IN_CARE" | "FINISHED";

export interface Emergency {
  id: string;
  description: string;
  location: string;
  priority: Priority;
  status: EmergencyStatus;
  ambulance_id: string | null;
  created_at: string;
}

export interface Ambulance {
  id: string;
  name: string;
  available: boolean;
}

export interface NewEmergency {
  description: string;
  location: string;
  priority: Priority;
}

export interface HealthResponse {
  api: string;
  grpc: "ok" | "unavailable";
}

export type ConnectionState = "checking" | "connected" | "grpc_down" | "offline";
