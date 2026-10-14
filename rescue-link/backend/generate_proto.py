"""Genera el código Python de gRPC a partir de proto/emergency.proto."""
from pathlib import Path

from grpc_tools import protoc

BASE_DIR = Path(__file__).parent
PROTO_DIR = BASE_DIR / "proto"
OUTPUT_DIR = BASE_DIR / "generated"


def main() -> None:
    OUTPUT_DIR.mkdir(exist_ok=True)
    (OUTPUT_DIR / "__init__.py").touch()

    exit_code = protoc.main([
        "grpc_tools.protoc",
        f"-I{PROTO_DIR}",
        f"--python_out={OUTPUT_DIR}",
        f"--grpc_python_out={OUTPUT_DIR}",
        str(PROTO_DIR / "emergency.proto"),
    ])
    if exit_code != 0:
        raise SystemExit(exit_code)

    # protoc genera "import emergency_pb2"; lo convertimos en import relativo del paquete.
    grpc_file = OUTPUT_DIR / "emergency_pb2_grpc.py"
    content = grpc_file.read_text(encoding="utf-8")
    content = content.replace("import emergency_pb2 as", "from . import emergency_pb2 as")
    grpc_file.write_text(content, encoding="utf-8")
    print(f"Código generado en {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
