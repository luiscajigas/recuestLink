"""API Gateway: traduce HTTP (Next.js) a llamadas gRPC. Ejecutar: uvicorn gateway.main:app"""
import os
from contextlib import asynccontextmanager

import grpc
from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from gateway.routes import ambulances, emergencies, health

load_dotenv()

HTTP_STATUS_BY_GRPC_CODE = {
    grpc.StatusCode.INVALID_ARGUMENT: 422,
    grpc.StatusCode.NOT_FOUND: 404,
    grpc.StatusCode.FAILED_PRECONDITION: 409,
    grpc.StatusCode.UNAVAILABLE: 503,
    grpc.StatusCode.DEADLINE_EXCEEDED: 504,
}


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Con EMBED_GRPC_SERVER=true el servidor gRPC corre dentro de este mismo proceso (útil en Render)."""
    embedded_server = None
    if os.getenv("EMBED_GRPC_SERVER", "false").lower() == "true":
        from grpc_server.server import DEFAULT_BIND_ADDRESS, create_server

        embedded_server, _ = create_server(os.getenv("GRPC_BIND_ADDRESS", DEFAULT_BIND_ADDRESS))
        embedded_server.start()
    yield
    if embedded_server is not None:
        embedded_server.stop(grace=2)


app = FastAPI(title="RescueLink Gateway", lifespan=lifespan)

allowed_origins = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
    if origin.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_methods=["GET", "POST", "PATCH"],
    allow_headers=["Content-Type"],
)


@app.exception_handler(grpc.RpcError)
async def handle_grpc_error(request: Request, error: grpc.RpcError):
    status_code = HTTP_STATUS_BY_GRPC_CODE.get(error.code(), 502)
    if status_code == 503:
        detail = "El servidor gRPC no está disponible."
    else:
        detail = error.details() or "Error al comunicarse con el servidor gRPC."
    return JSONResponse(status_code=status_code, content={"detail": detail})


app.include_router(health.router)
app.include_router(emergencies.router)
app.include_router(ambulances.router)
