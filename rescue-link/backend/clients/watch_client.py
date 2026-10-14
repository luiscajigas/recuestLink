"""Cliente de prueba de server streaming. Ejecutar desde backend/: python -m clients.watch_client"""
import os

import grpc

from generated import emergency_pb2 as pb2
from generated import emergency_pb2_grpc as pb2_grpc

DEFAULT_SERVER_ADDRESS = "127.0.0.1:50051"


def format_event(event: pb2.EmergencyEvent) -> str:
    event_name = pb2.EventType.Name(event.event_type).removeprefix("EVENT_")
    if not event.HasField("emergency"):
        return f"[{event_name}] Suscripción activa, esperando cambios..."
    emergency = event.emergency
    status = pb2.Status.Name(emergency.status).removeprefix("STATUS_")
    priority = pb2.Priority.Name(emergency.priority).removeprefix("PRIORITY_")
    ambulance = emergency.ambulance_id or "sin ambulancia"
    return f"[{event_name}] {emergency.id} | prioridad {priority} | estado {status} | {ambulance} | {emergency.location}"


def watch(address: str) -> None:
    with grpc.insecure_channel(address) as channel:
        stub = pb2_grpc.EmergencyServiceStub(channel)
        print(f"Conectando a {address} (Ctrl+C para salir)")
        try:
            for event in stub.WatchEmergencies(pb2.WatchEmergenciesRequest()):
                print(format_event(event))
        except KeyboardInterrupt:
            print("\nCliente detenido.")
        except grpc.RpcError as error:
            print(f"Error gRPC: {error.code().name} - {error.details()}")


if __name__ == "__main__":
    watch(os.getenv("GRPC_SERVER_ADDRESS", DEFAULT_SERVER_ADDRESS))
