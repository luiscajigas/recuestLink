"""Modelos HTTP y conversión entre mensajes protobuf y JSON."""
from typing import Literal

from pydantic import BaseModel

from generated import emergency_pb2 as pb2

PriorityName = Literal["LOW", "MEDIUM", "HIGH"]
StatusName = Literal["REPORTED", "EN_ROUTE", "IN_CARE", "FINISHED"]


class EmergencyCreate(BaseModel):
    description: str
    location: str
    priority: PriorityName


class AmbulanceAssignment(BaseModel):
    ambulance_id: str


class StatusUpdate(BaseModel):
    status: StatusName


def priority_to_proto(name: PriorityName) -> int:
    return pb2.Priority.Value(f"PRIORITY_{name}")


def status_to_proto(name: StatusName) -> int:
    return pb2.Status.Value(f"STATUS_{name}")


def emergency_to_dict(emergency: pb2.Emergency) -> dict:
    return {
        "id": emergency.id,
        "description": emergency.description,
        "location": emergency.location,
        "priority": pb2.Priority.Name(emergency.priority).removeprefix("PRIORITY_"),
        "status": pb2.Status.Name(emergency.status).removeprefix("STATUS_"),
        "ambulance_id": emergency.ambulance_id or None,
        "created_at": emergency.created_at,
    }


def ambulance_to_dict(ambulance: pb2.Ambulance) -> dict:
    return {"id": ambulance.id, "name": ambulance.name, "available": ambulance.available}
