from fastapi import APIRouter, Depends

from gateway.grpc_client import RPC_TIMEOUT_SECONDS, get_stub
from gateway.schemas import (
    AmbulanceAssignment,
    EmergencyCreate,
    StatusUpdate,
    emergency_to_dict,
    priority_to_proto,
    status_to_proto,
)
from generated import emergency_pb2 as pb2

router = APIRouter(prefix="/api/emergencies", tags=["emergencias"])


@router.get("")
def list_emergencies(stub=Depends(get_stub)):
    response = stub.ListEmergencies(pb2.ListEmergenciesRequest(), timeout=RPC_TIMEOUT_SECONDS)
    return [emergency_to_dict(emergency) for emergency in response.emergencies]


@router.post("", status_code=201)
def create_emergency(body: EmergencyCreate, stub=Depends(get_stub)):
    request = pb2.CreateEmergencyRequest(
        description=body.description,
        location=body.location,
        priority=priority_to_proto(body.priority),
    )
    return emergency_to_dict(stub.CreateEmergency(request, timeout=RPC_TIMEOUT_SECONDS))


@router.post("/{emergency_id}/assign")
def assign_ambulance(emergency_id: str, body: AmbulanceAssignment, stub=Depends(get_stub)):
    request = pb2.AssignAmbulanceRequest(emergency_id=emergency_id, ambulance_id=body.ambulance_id)
    return emergency_to_dict(stub.AssignAmbulance(request, timeout=RPC_TIMEOUT_SECONDS))


@router.patch("/{emergency_id}/status")
def update_status(emergency_id: str, body: StatusUpdate, stub=Depends(get_stub)):
    request = pb2.UpdateEmergencyStatusRequest(
        emergency_id=emergency_id, status=status_to_proto(body.status)
    )
    return emergency_to_dict(stub.UpdateEmergencyStatus(request, timeout=RPC_TIMEOUT_SECONDS))
