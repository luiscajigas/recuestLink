import pytest
from fastapi.testclient import TestClient

from gateway.grpc_client import get_stub
from gateway.main import app

NEW_EMERGENCY = {
    "description": "Accidente de tránsito con heridos",
    "location": "Avenida principal, frente al parque",
    "priority": "HIGH",
}


@pytest.fixture
def client(grpc_stub):
    app.dependency_overrides[get_stub] = lambda: grpc_stub
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


def test_health_reports_grpc_connection(client):
    assert client.get("/api/health").json() == {"api": "ok", "grpc": "ok"}


def test_create_and_list_emergencies(client):
    created = client.post("/api/emergencies", json=NEW_EMERGENCY)
    listed = client.get("/api/emergencies")

    assert created.status_code == 201
    assert created.json()["status"] == "REPORTED"
    assert [e["id"] for e in listed.json()] == [created.json()["id"]]


def test_assign_ambulance_and_update_status(client):
    emergency_id = client.post("/api/emergencies", json=NEW_EMERGENCY).json()["id"]

    assigned = client.post(f"/api/emergencies/{emergency_id}/assign", json={"ambulance_id": "AMB-01"})
    finished = client.patch(f"/api/emergencies/{emergency_id}/status", json={"status": "FINISHED"})

    assert assigned.json()["ambulance_id"] == "AMB-01"
    assert finished.json()["status"] == "FINISHED"
    ambulances = {a["id"]: a["available"] for a in client.get("/api/ambulances").json()}
    assert ambulances["AMB-01"] is True


def test_grpc_errors_become_http_errors(client):
    missing = client.patch("/api/emergencies/EMG-999/status", json={"status": "IN_CARE"})
    invalid = client.post("/api/emergencies", json={**NEW_EMERGENCY, "description": "x"})

    assert missing.status_code == 404
    assert invalid.status_code == 422
    assert "descripción" in invalid.json()["detail"]
