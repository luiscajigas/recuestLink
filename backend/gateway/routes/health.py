import grpc
from fastapi import APIRouter, Depends

from gateway.grpc_client import get_stub
from generated import emergency_pb2 as pb2

router = APIRouter(tags=["estado"])


@router.get("/api/health")
def health(stub=Depends(get_stub)):
    """Siempre responde 200; el campo "grpc" indica si el servidor gRPC está accesible."""
    try:
        stub.ListAmbulances(pb2.ListAmbulancesRequest(), timeout=2)
        grpc_status = "ok"
    except grpc.RpcError:
        grpc_status = "unavailable"
    return {"api": "ok", "grpc": grpc_status}
