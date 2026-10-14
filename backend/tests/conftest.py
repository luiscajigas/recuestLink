import grpc
import pytest

from generated import emergency_pb2_grpc as pb2_grpc
from grpc_server.server import create_server


@pytest.fixture
def grpc_stub():
    """Servidor gRPC real en un puerto libre, con datos en memoria nuevos para cada prueba."""
    server, port = create_server("127.0.0.1:0")
    server.start()
    channel = grpc.insecure_channel(f"127.0.0.1:{port}")
    yield pb2_grpc.EmergencyServiceStub(channel)
    channel.close()
    server.stop(grace=None)
