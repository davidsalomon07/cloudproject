# Monitor de Servidores (MicroCheck)

Sistema de monitoreo de servidores en tiempo real con arquitectura multi-contenedor.

## Estructura del Proyecto

```
cloudproject/
├── backend/              # API REST con Spring Boot + Kotlin
│   ├── src/main/         # Código fuente
│   ├── src/test/         # Pruebas (H2 en memoria)
│   ├── build.gradle.kts
│   └── Dockerfile
├── frontend/             # React + Vite + Tailwind CSS 4
│   ├── src/
│   └── Dockerfile
├── database/             # Scripts SQL (DBA)
│   ├── init/             # Ejecutados al primer arranque de PostgreSQL
│   │   ├── 01-schema.sql # DDL: tablas, FK, índices
│   │   └── 02-seed.sql   # Datos demo
│   └── scripts/
│       └── apply_constraints.sql  # Migración manual para volúmenes legacy
├── docs/
│   └── database/         # Diseño BD, credenciales, pruebas de persistencia
├── docker-compose.yml    # Orquestación: postgres + backend + frontend
├── .env                  # Variables de entorno del proyecto (incluido en el repo)
└── README.md
```

## Tecnologías

### Backend
- **Kotlin** 2.2.21 + Spring Boot 4.0.6
- **PostgreSQL** 17 (Docker) / **H2** (desarrollo local y pruebas)
- **JPA/Hibernate** — perfil `docker`: `ddl-auto: validate` (esquema gobernado por scripts SQL)
- **WebSocket** STOMP para alertas en tiempo real

### Frontend
- **React** 19 + **TypeScript** 5.8
- **Vite** 6 + **Tailwind CSS** 4
- **STOMP.js** + **SockJS**

### Base de Datos
- **PostgreSQL** 17-alpine en Docker
- Volumen persistente `postgres_data`
- Inicialización automática vía `database/init/` montado en `/docker-entrypoint-initdb.d`
- Tablas: `servers`, `server_history`

Documentación detallada: [`docs/database/DISEÑO_BD.md`](docs/database/DISEÑO_BD.md)

## Seguridad

- Autenticación por API Key (comparación en tiempo constante)
- Rate Limiting por IP con cabeceras `X-RateLimit`
- Anti-SSRF en validación de URLs
- CORS restringido al origen del frontend
- Credenciales de BD inyectadas vía `.env`, no en código fuente

## Configuración

### Prerrequisitos
- **Java** 21 JDK
- **Node.js** 18+
- **Docker** + Docker Compose (recomendado para PostgreSQL y despliegue completo)

### Variables de Entorno

El archivo [`.env`](.env) en la raíz ya contiene la configuración del proyecto. Docker Compose lo carga automáticamente (`env_file: .env`).

| Variable | Descripción | Valor en el proyecto |
|---|---|---|
| `DB_NAME` | Nombre de la base de datos PostgreSQL | `monitoring` |
| `DB_USER` | Usuario PostgreSQL | `postgres` |
| `DB_PASSWORD` | Contraseña PostgreSQL | `admin123` |
| `API_KEY` | Clave para autenticación de API (también en el engranaje de la UI) | `changeme` |
| `FRONTEND_ORIGIN` | Orígenes CORS/WebSocket permitidos (separados por coma) | `http://localhost:5173,http://localhost:80` |
| `TELEGRAM_BOT_TOKEN` | Token del bot de Telegram | configurado en `.env` |
| `TELEGRAM_CHAT_ID` | ID del chat de Telegram | configurado en `.env` |

Flujo: `.env` → `docker-compose.yml` → contenedores (`POSTGRES_*` / `SPRING_DATASOURCE_*` / `API_KEY` / `FRONTEND_ORIGIN`).

Cuando el **backend corre en Docker**, `docker-compose.yml` activa el perfil `docker` (`SPRING_PROFILES_ACTIVE: docker`) con PostgreSQL y `ddl-auto: validate`. No requiere configuración adicional.

Detalle: [`docs/database/CREDENCIALES.md`](docs/database/CREDENCIALES.md)

### Ejecución con Docker (recomendado)

Desde la **raíz del repositorio**:

```bash
# Stack completo (postgres + backend + frontend)
docker compose up --build -d

# Solo base de datos y backend
docker compose up --build -d postgres backend
```

En Windows también puedes usar los scripts de arranque (equivalente a `docker compose up --build -d`):

```bash
.\start-project.ps1
# o
start-project.bat
```

Inicialización limpia (recrea esquema y seeds):

```bash
docker compose down -v
docker compose up --build -d
```

Verificar base de datos:

```bash
docker exec monitoring-db psql -U postgres -d monitoring -c "\dt"
docker exec monitoring-db psql -U postgres -d monitoring -c "SELECT id, name, url, status FROM servers;"
```

La aplicación estará disponible en:
- **Frontend:** http://localhost:80
- **API:** http://localhost:8080

Procedimiento completo de validación: [`docs/database/PRUEBA_PERSISTENCIA.md`](docs/database/PRUEBA_PERSISTENCIA.md)

### Ejecución híbrida (desarrollo con PostgreSQL real)

Recomendado para desarrollo con BD real y proxy Vite:

```bash
docker compose up -d postgres backend
cd frontend && npm install && npm run dev
```

- **Frontend:** http://localhost:5173 (proxy `/api` y `/ws` → backend)
- Configurar **API Key** `changeme` en el engranaje de la UI

### Ejecución local (solo backend, H2 en memoria)

Alternativa sin Docker: el perfil `dev` (por defecto en `application.yaml`) usa **H2 en memoria**, no PostgreSQL.

```bash
# Backend
cd backend
./gradlew bootRun

# Frontend (otra terminal)
cd frontend
npm install
npm run dev
```

- **Frontend:** http://localhost:5173
- **API:** http://localhost:8080

> **Nota:** Este modo no usa el `.env` ni PostgreSQL. Para la exposición del proyecto con BD real, usar **Docker** o el modo **híbrido** de arriba (`docker compose up -d postgres backend`).

## Pruebas

```bash
cd backend
./gradlew test
```

Las pruebas usan **H2 en memoria** con el perfil `test`.

## API REST

### Dashboard
- `GET /api/dashboard` — Resumen del estado de servidores

### Servidores
- `GET /api/servers` — Listar todos
- `GET /api/servers/{id}` — Obtener por ID
- `POST /api/servers` — Crear
- `PUT /api/servers/{id}` — Actualizar
- `DELETE /api/servers/{id}` — Eliminar

### Historial
- `GET /api/history` — Historial completo
- `GET /api/history/{serverId}` — Historial por servidor

### WebSocket
- `GET /ws` — Endpoint STOMP
- Suscripción: `/topic/alerts`

## Despliegue

```bash
docker compose up --build -d
```

Servicios:
| Contenedor | Puerto | Descripción |
|---|---|---|
| `monitoring-db` | 5432 (interno) | PostgreSQL 17 con volumen persistente |
| `monitoring-backend` | 8080 | API Spring Boot |
| `monitoring-frontend` | 80 | Nginx + React |

## Documentación adicional

| Documento | Contenido |
|---|---|
| [`docs/database/DISEÑO_BD.md`](docs/database/DISEÑO_BD.md) | Modelo ER, diccionario de datos |
| [`docs/database/CREDENCIALES.md`](docs/database/CREDENCIALES.md) | Variables y flujo de credenciales |
| [`docs/database/PRUEBA_PERSISTENCIA.md`](docs/database/PRUEBA_PERSISTENCIA.md) | Pruebas de integridad y persistencia |
| [`docs/database/INFORME_EJECUCION_DB.md`](docs/database/INFORME_EJECUCION_DB.md) | Informe de implementación DBA |

## Licencia

MIT
