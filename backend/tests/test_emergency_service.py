import grpc
import pytest

from generated import emergency_pb2 as pb2


def create_emergency(stub, priority=pb2.PRIORITY_HIGH):
    request = pb2.CreateEmergencyRequest(
        description="Paciente con dolor en el pecho",
        location="Calle 10 con carrera 5, zona centro",
        priority=priority,
    )
    return stub.CreateEmergency(request)


def test_create_emergency(grpc_stub):
    emergency = create_emergency(grpc_stub)

    assert emergency.id == "EMG-001"
    assert emergency.status == pb2.STATUS_REPORTED
    assert emergency.priority == pb2.PRIORITY_HIGH
    assert emergency.ambulance_id == ""


def test_create_emergency_rejects_short_description(grpc_stub):
    request = pb2.CreateEmergencyRequest(description="ab", location="Calle 1", priority=pb2.PRIORITY_LOW)

    with pytest.raises(grpc.RpcError) as error:
        grpc_stub.CreateEmergency(request)

    assert error.value.code() == grpc.StatusCode.INVALID_ARGUMENT


def test_list_emergencies_returns_newest_first(grpc_stub):
    first = create_emergency(grpc_stub)
    second = create_emergency(grpc_stub, pb2.PRIORITY_LOW)

    response = grpc_stub.ListEmergencies(pb2.ListEmergenciesRequest())

    assert [e.id for e in response.emergencies] == [second.id, first.id]


def test_list_ambulances_has_demo_data(grpc_stub):
    response = grpc_stub.ListAmbulances(pb2.ListAmbulancesRequest())

    assert len(response.ambulances) == 4
    assert all(ambulance.available for ambulance in response.ambulances)


def test_assign_ambulance(grpc_stub):
    emergency = create_emergency(grpc_stub)

    updated = grpc_stub.AssignAmbulance(
        pb2.AssignAmbulanceRequest(emergency_id=emergency.id, ambulance_id="AMB-01")
    )

    assert updated.ambulance_id == "AMB-01"
    assert updated.status == pb2.STATUS_EN_ROUTE
    ambulances = grpc_stub.ListAmbulances(pb2.ListAmbulancesRequest()).ambulances
    assert {a.id: a.available for a in ambulances}["AMB-01"] is False


def test_assign_busy_ambulance_fails(grpc_stub):
    first = create_emergency(grpc_stub)
    second = create_emergency(grpc_stub)
    grpc_stub.AssignAmbulance(pb2.AssignAmbulanceRequest(emergency_id=first.id, ambulance_id="AMB-01"))

    with pytest.raises(grpc.RpcError) as error:
        grpc_stub.AssignAmbulance(pb2.AssignAmbulanceRequest(emergency_id=second.id, ambulance_id="AMB-01"))

    assert error.value.code() == grpc.StatusCode.FAILED_PRECONDITION


def test_update_status_and_release_ambulance(grpc_stub):
    emergency = create_emergency(grpc_stub)
    grpc_stub.AssignAmbulance(pb2.AssignAmbulanceRequest(emergency_id=emergency.id, ambulance_id="AMB-02"))

    in_care = grpc_stub.UpdateEmergencyStatus(
        pb2.UpdateEmergencyStatusRequest(emergency_id=emergency.id, status=pb2.STATUS_IN_CARE)
    )
    finished = grpc_stub.UpdateEmergencyStatus(
        pb2.UpdateEmergencyStatusRequest(emergency_id=emergency.id, status=pb2.STATUS_FINISHED)
    )

    assert in_care.status == pb2.STATUS_IN_CARE
    assert finished.status == pb2.STATUS_FINISHED
    ambulances = grpc_stub.ListAmbulances(pb2.ListAmbulancesRequest()).ambulances
    assert {a.id: a.available for a in ambulances}["AMB-02"] is True


def test_update_unknown_emergency_returns_not_found(grpc_stub):
    with pytest.raises(grpc.RpcError) as error:
        grpc_stub.UpdateEmergencyStatus(
            pb2.UpdateEmergencyStatusRequest(emergency_id="EMG-999", status=pb2.STATUS_IN_CARE)
        )

    assert error.value.code() == grpc.StatusCode.NOT_FOUND


def test_watch_emergencies_streams_updates(grpc_stub):
    stream = grpc_stub.WatchEmergencies(pb2.WatchEmergenciesRequest(), timeout=10)
    try:
        assert next(stream).event_type == pb2.EVENT_CONNECTED

        emergency = create_emergency(grpc_stub)
        created_event = next(stream)
        assert created_event.event_type == pb2.EVENT_CREATED
        assert created_event.emergency.id == emergency.id

        grpc_stub.AssignAmbulance(pb2.AssignAmbulanceRequest(emergency_id=emergency.id, ambulance_id="AMB-03"))
        updated_event = next(stream)
        assert updated_event.event_type == pb2.EVENT_UPDATED
        assert updated_event.emergency.ambulance_id == "AMB-03"
    finally:
        stream.cancel()
