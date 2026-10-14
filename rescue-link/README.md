# RescueLink

Aplicación web de demostración para un taller universitario de **gRPC**. Permite registrar emergencias médicas **ficticias**, ver su estado, asignarles una ambulancia disponible y cambiar su estado (reportada, en camino, en atención, finalizada).

## Arquitectura

```text
Navegador (Next.js) --HTTP/JSON--> FastAPI (gateway) --gRPC--> Servidor gRPC (Python)
                                                                 └─ datos en memoria
```

```text
rescue-link/
├── frontend/              Next.js (App Router) + TypeScript + Tailwind + Lucide
│   └── src/{app,components,hooks,services,lib,types}
├── backend/
│   ├── proto/emergency.proto   Contrato gRPC (mensajes y servicio)
│   ├── generated/              Código cliente/servidor generado desde el .proto
│   ├── grpc_server/            Servidor gRPC y lógica del servicio
│   ├── gateway/                FastAPI: convierte HTTP en llamadas gRPC
│   ├── clients/watch_client.py Cliente de prueba de server streaming
│   ├── tests/                  Pruebas (pytest)
│   └── generate_proto.py       Regenera el código desde el .proto
├── render.yaml            Configuración opcional para desplegar el backend en Render
└── README.md
```

## ¿Qué es gRPC y por qué se usa?

gRPC es un framework de llamadas a procedimientos remotos. El contrato se escribe una vez en un archivo `.proto` (Protocol Buffers) y de él se genera el código de cliente y servidor. Los mensajes viajan en formato binario sobre HTTP/2, lo que es más compacto que JSON y permite **streaming**. Aquí el servicio ofrece cuatro llamadas unarias (`CreateEmergency`, `ListEmergencies`, `AssignAmbulance`, `UpdateEmergencyStatus`), una auxiliar (`ListAmbulances`) y una de **server streaming** (`WatchEmergencies`).

Los navegadores no hablan gRPC nativo, por eso FastAPI actúa como gateway: recibe HTTP del frontend y llama al servidor mediante el cliente gRPC generado.

**Reglas del servicio:** al asignar una ambulancia, una emergencia «Reportada» pasa a «En camino»; al finalizarla, la ambulancia queda libre; una emergencia finalizada ya no se puede modificar.

> **Los datos se guardan en memoria**: se reinician cada vez que se reinicia el backend (por ejemplo, cuando Render duerme el servicio gratuito). Las 4 ambulancias de demostración se cargan al iniciar.

## Generar el código desde el `.proto`

El código ya viene generado en `backend/generated/`. Si modificas `emergency.proto`:

```bash
cd backend
pip install -r requirements-dev.txt
python generate_proto.py
```

## Ejecutar en local

Requisitos: Python 3.12+ y Node.js 20+. No se necesita Docker. El backend se inicia por separado del frontend.

**Backend** (dos terminales, desde `backend/`):

```bash
python -m venv .venv
# Windows: .venv\Scripts\activate      Mac/Linux: source .venv/bin/activate
pip install -r requirements-dev.txt

# Terminal 1: servidor gRPC (puerto 50051)
python -m grpc_server.server

# Terminal 2: gateway FastAPI (puerto 8000; documentación en http://localhost:8000/docs)
uvicorn gateway.main:app --reload --port 8000
```

Alternativa en una sola terminal: define `EMBED_GRPC_SERVER=true` y el gateway inicia el servidor gRPC dentro de su proceso.

**Frontend** (desde `frontend/`):

```bash
# Windows: copy .env.example .env.local     Mac/Linux: cp .env.example .env.local
npm install
npm run dev
```

Abre http://localhost:3000. El indicador del encabezado muestra si el backend y gRPC responden.

## Probar el streaming

Con el servidor gRPC y el gateway en marcha, abre una tercera terminal en `backend/`:

```bash
python -m clients.watch_client
```

Verás `[CONNECTED]`. Luego registra, asigna o cambia el estado de una emergencia desde la interfaz (o desde http://localhost:8000/docs) y el cliente imprimirá un evento `[CREATED]` o `[UPDATED]` por cada cambio.

## Pruebas

```bash
cd backend
python -m pytest -v
```

Cubren crear, listar, asignar, actualizar estado y recibir actualizaciones por server streaming (contra un servidor gRPC real en un puerto libre), además del mapeo de errores en el gateway.

## Despliegue

### Backend en Render (servicio web gratuito, sin Docker)

1. Sube el repositorio a GitHub.
2. En Render: **New > Blueprint** y selecciona el repositorio (usa `render.yaml`), o **New > Web Service** con estos datos:
   - Root Directory: `backend`
   - Runtime: Python · Build: `pip install -r requirements.txt`
   - Start: `uvicorn gateway.main:app --host 0.0.0.0 --port $PORT`
   - Health Check Path: `/api/health`
3. Variables de entorno: `PYTHON_VERSION=3.12.3`, `EMBED_GRPC_SERVER=true` y `CORS_ORIGINS` (ver abajo).

Con `EMBED_GRPC_SERVER=true`, un único servicio ejecuta el gateway y el servidor gRPC (este último solo accesible dentro del servicio). Usa un solo worker de uvicorn: con más de uno, cada worker tendría sus propios datos en memoria.

El plan gratuito duerme el servicio tras 15 minutos sin tráfico y tarda cerca de un minuto en despertar; al hacerlo se pierden los datos en memoria. Abre la URL unos minutos antes de una presentación.

### Frontend en Vercel

1. En Vercel: **Add New > Project**, importa el repositorio y define **Root Directory** = `frontend`.
2. Variable de entorno `NEXT_PUBLIC_API_URL` = URL pública de Render (por ejemplo `https://rescuelink-api.onrender.com`, sin `/` final).
3. Despliega. Si cambias la variable después, vuelve a desplegar: `NEXT_PUBLIC_*` se incorpora en tiempo de compilación.

### CORS

El gateway solo acepta los orígenes de `CORS_ORIGINS` (separados por coma, sin `/` final). En Render define, por ejemplo:

```text
CORS_ORIGINS=http://localhost:3000,https://tu-app.vercel.app
```

Los dominios de vista previa de Vercel (`*-git-rama-*.vercel.app`) son distintos al de producción y tendrías que agregarlos a la lista.
