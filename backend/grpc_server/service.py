"""Servicio gRPC de emergencias. Los datos viven en memoria: se reinician con el servidor."""
import queue
import threading
from datetime import datetime, timezone

import grpc

from generated import emergency_pb2 as pb2
from generated import emergency_pb2_grpc as pb2_grpc

DEMO_AMBULANCES = [
    ("AMB-01", "Unidad Norte"),
    ("AMB-02", "Unidad Sur"),
    ("AMB-03", "Unidad Centro"),
    ("AMB-04", "Unidad Oriente"),
]
MIN_DESCRIPTION_LENGTH = 5
MIN_LOCATION_LENGTH = 3


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def _snapshot(message):
    """Copia un mensaje para no exponer el objeto guardado en memoria."""
    clone = type(message)()
    clone.CopyFrom(message)
    return clone


class EmergencyService(pb2_grpc.EmergencyServiceServicer):
    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._emergencies: dict[str, pb2.Emergency] = {}
        self._ambulances = {
            ambulance_id: pb2.Ambulance(id=ambulance_id, name=name, available=True)
            for ambulance_id, name in DEMO_AMBULANCES
        }
        self._subscribers: list[queue.Queue] = []
        self._counter = 0

    def CreateEmergency(self, request, context):
        description = request.description.strip()
        location = request.location.strip()
        if len(description) < MIN_DESCRIPTION_LENGTH:
            context.abort(grpc.StatusCode.INVALID_ARGUMENT,
                          f"La descripción debe tener al menos {MIN_DESCRIPTION_LENGTH} caracteres.")
        if len(location) < MIN_LOCATION_LENGTH:
            context.abort(grpc.StatusCode.INVALID_ARGUMENT,
                          f"La ubicación debe tener al menos {MIN_LOCATION_LENGTH} caracteres.")
        if request.priority == pb2.PRIORITY_UNSPECIFIED:
            context.abort(grpc.StatusCode.INVALID_ARGUMENT, "Debes indicar la prioridad.")

        with self._lock:
            self._counter += 1
            emergency = pb2.Emergency(
                id=f"EMG-{self._counter:03d}",
                description=description,
                location=location,
                priority=request.priority,
                status=pb2.STATUS_REPORTED,
                created_at=_now_iso(),
            )
            self._emergencies[emergency.id] = emergency
            self._publish(pb2.EVENT_CREATED, emergency)
            return _snapshot(emergency)

    def ListEmergencies(self, request, context):
        with self._lock:
            newest_first = list(reversed(self._emergencies.values()))
            return pb2.ListEmergenciesResponse(emergencies=newest_first)

    def ListAmbulances(self, request, context):
        with self._lock:
            return pb2.ListAmbulancesResponse(ambulances=list(self._ambulances.values()))

    def AssignAmbulance(self, request, context):
        with self._lock:
            emergency = self._find_emergency(request.emergency_id, context)
            ambulance = self._ambulances.get(request.ambulance_id)
            if ambulance is None:
                context.abort(grpc.StatusCode.NOT_FOUND, "La ambulancia no existe.")
            if emergency.status == pb2.STATUS_FINISHED:
                context.abort(grpc.StatusCode.FAILED_PRECONDITION, "La emergencia ya fue finalizada.")
            if emergency.ambulance_id:
                context.abort(grpc.StatusCode.FAILED_PRECONDITION, "La emergencia ya tiene una ambulancia asignada.")
            if not ambulance.available:
                context.abort(grpc.StatusCode.FAILED_PRECONDITION, "La ambulancia no está disponible.")

            ambulance.available = False
            emergency.ambulance_id = ambulance.id
            if emergency.status == pb2.STATUS_REPORTED:
                emergency.status = pb2.STATUS_EN_ROUTE
            self._publish(pb2.EVENT_UPDATED, emergency)
            return _snapshot(emergency)

    def UpdateEmergencyStatus(self, request, context):
        if request.status == pb2.STATUS_UNSPECIFIED:
            context.abort(grpc.StatusCode.INVALID_ARGUMENT, "Debes indicar el nuevo estado.")
        with self._lock:
            emergency = self._find_emergency(request.emergency_id, context)
            if emergency.status == pb2.STATUS_FINISHED:
                context.abort(grpc.StatusCode.FAILED_PRECONDITION, "La emergencia ya fue finalizada.")

            emergency.status = request.status
            if request.status == pb2.STATUS_FINISHED and emergency.ambulance_id:
                self._ambulances[emergency.ambulance_id].available = True
            self._publish(pb2.EVENT_UPDATED, emergency)
            return _snapshot(emergency)

    def WatchEmergencies(self, request, context):
        updates: queue.Queue = queue.Queue()
        with self._lock:
            self._subscribers.append(updates)
        try:
            # Confirma al cliente que ya está suscrito antes de enviar cambios.
            yield pb2.EmergencyEvent(event_type=pb2.EVENT_CONNECTED)
            while context.is_active():
                try:
                    yield updates.get(timeout=1)
                except queue.Empty:
                    continue
        finally:
            with self._lock:
                self._subscribers.remove(updates)

    def _find_emergency(self, emergency_id: str, context) -> pb2.Emergency:
        emergency = self._emergencies.get(emergency_id)
        if emergency is None:
            context.abort(grpc.StatusCode.NOT_FOUND, "La emergencia no existe.")
        return emergency

    def _publish(self, event_type: int, emergency: pb2.Emergency) -> None:
        event = pb2.EmergencyEvent(event_type=event_type, emergency=emergency)
        for subscriber in self._subscribers:
            subscriber.put(event)
