from fastapi import APIRouter, Depends

from gateway.grpc_client import RPC_TIMEOUT_SECONDS, get_stub
from gateway.schemas import ambulance_to_dict
from generated import emergency_pb2 as pb2

router = APIRouter(prefix="/api/ambulances", tags=["ambulancias"])


@router.get("")
def list_ambulances(stub=Depends(get_stub)):
    response = stub.ListAmbulances(pb2.ListAmbulancesRequest(), timeout=RPC_TIMEOUT_SECONDS)
    return [ambulance_to_dict(ambulance) for ambulance in response.ambulances]
