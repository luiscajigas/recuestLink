"""Cliente gRPC compartido por el gateway."""
import os
from functools import lru_cache

import grpc

from generated import emergency_pb2_grpc as pb2_grpc

DEFAULT_SERVER_ADDRESS = "127.0.0.1:50051"
RPC_TIMEOUT_SECONDS = 5


@lru_cache
def _get_channel(address: str) -> grpc.Channel:
    return grpc.insecure_channel(address)


def get_stub() -> pb2_grpc.EmergencyServiceStub:
    """Dependencia de FastAPI: stub generado desde el .proto."""
    address = os.getenv("GRPC_SERVER_ADDRESS", DEFAULT_SERVER_ADDRESS)
    return pb2_grpc.EmergencyServiceStub(_get_channel(address))
