"""Arranque del servidor gRPC. Ejecutar desde backend/: python -m grpc_server.server"""
import os
from concurrent.futures import ThreadPoolExecutor

import grpc

from generated import emergency_pb2_grpc as pb2_grpc
from grpc_server.service import EmergencyService

DEFAULT_BIND_ADDRESS = "127.0.0.1:50051"


def create_server(address: str = DEFAULT_BIND_ADDRESS) -> tuple[grpc.Server, int]:
    """Crea el servidor sin iniciarlo. Devuelve también el puerto realmente asignado."""
    server = grpc.server(ThreadPoolExecutor(max_workers=10))
    pb2_grpc.add_EmergencyServiceServicer_to_server(EmergencyService(), server)
    port = server.add_insecure_port(address)
    return server, port


def serve() -> None:
    address = os.getenv("GRPC_BIND_ADDRESS", DEFAULT_BIND_ADDRESS)
    server, _ = create_server(address)
    server.start()
    print(f"Servidor gRPC escuchando en {address}")
    try:
        server.wait_for_termination()
    except KeyboardInterrupt:
        server.stop(grace=2)


if __name__ == "__main__":
    serve()
