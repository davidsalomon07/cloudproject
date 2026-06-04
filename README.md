# Sistema de Monitoreo de Servidores

Backend Spring Boot (Kotlin) para monitorear servidores HTTP, registrar cambios de estado, enviar alertas en tiempo real y notificaciones por Telegram.

Repositorio: [github.com/davidsalomon07/cloudproject](https://github.com/davidsalomon07/cloudproject)

---

## Estado del proyecto

| Parte | Responsable | Estado |
|-------|-------------|--------|
| Base del backend (fases 1–5) | Compañero | Implementado |
| Historial, WebSocket, Telegram, Dashboard (fases 6–9) | Backend | Implementado |
| Endurecimiento de seguridad | Backend | Implementado |
| Frontend + compose en raíz (fase 10) | Pendiente | Por otro integrante |

---

## Base del proyecto — lo que ya estaba implementado

Esta sección documenta el trabajo inicial del proyecto: arquitectura, base de datos, Docker y monitoreo automático.

### Arquitectura por capas

El backend sigue el patrón **Controller → Service → Repository → Model** sin mezclar responsabilidades:

```
Controller   → expone la API REST
Service      → lógica de negocio
Repository   → acceso a datos (JPA)
Model        → entidades de base de datos
DTO          → objetos de entrada/salida de la API
```

### Tecnologías base

- **Kotlin** 2.2
- **Spring Boot** 4.0
- **Spring Data JPA** + **Hibernate**
- **PostgreSQL** 17
- **Gradle** (Java 21)
- **Docker** + **docker-compose**

Dependencias principales en `backend/build.gradle.kts`:

- `spring-boot-starter-webmvc`
- `spring-boot-starter-data-jpa`
- `spring-boot-starter-validation`
- `spring-boot-starter-websocket`
- Driver `postgresql`

### Modelos de datos

#### `Server` (tabla `servers`)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | Long | Identificador autogenerado |
| `name` | String | Nombre del servidor |
| `url` | String | URL a monitorear (única) |
| `status` | Enum | `ONLINE`, `OFFLINE` o `UNKNOWN` |

#### `ServerStatus`

Estados posibles de un servidor:

- `UNKNOWN` — estado inicial al crear el servidor
- `ONLINE` — responde HTTP 2xx
- `OFFLINE` — no responde o error

#### `ServerHistory` (tabla `server_history`)

Entidad preparada desde la base; en las fases 6–9 se completó para registrar cambios de estado.

### CRUD de servidores

Implementado en:

- `controllers/ServerController.kt`
- `services/ServerService.kt`
- `repositories/ServerRepository.kt`
- DTOs: `CreateServerRequest`, `UpdateServerRequest`, `ServerResponse`

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/servers` | Listar todos los servidores |
| GET | `/api/servers/{id}` | Obtener un servidor por ID |
| POST | `/api/servers` | Crear servidor (status inicial `UNKNOWN`) |
| PUT | `/api/servers/{id}` | Actualizar nombre y URL |
| DELETE | `/api/servers/{id}` | Eliminar servidor |

**Body de creación/actualización:**

```json
{
  "name": "Google",
  "url": "https://www.google.com"
}
```

**Respuesta (`ServerResponse`):**

```json
{
  "id": 1,
  "name": "Google",
  "url": "https://www.google.com",
  "status": "ONLINE"
}
```

### Scheduler de monitoreo automático

Archivo: `scheduler/ServerMonitoringScheduler.kt`

- Se ejecuta **cada 30 segundos** (`@Scheduled(fixedRate = 30000)`)
- Recorre todos los servidores registrados
- Hace una petición **GET** HTTP a la URL de cada uno
- Timeout de conexión y lectura: **5 segundos**
- Actualiza el estado:
  - Código **200–299** → `ONLINE`
  - Cualquier otro código o error → `OFFLINE`

Activado con `@EnableScheduling` en `BackendApplication.kt`.

### Configuración y perfiles

| Archivo | Uso |
|---------|-----|
| `application.yaml` | Configuración general y perfil activo |
| `application-docker.yml` | Conexión a PostgreSQL dentro de Docker |

**Perfil docker** — datasource:

- Host: `postgres` (servicio Docker)
- Base de datos: `monitoring`
- Usuario: `postgres`
- Hibernate: `ddl-auto: update` (crea/actualiza tablas automáticamente)

### Docker y PostgreSQL

Archivos en `backend/`:

| Archivo | Descripción |
|---------|-------------|
| `Dockerfile` | Imagen JDK 21, compila con Gradle y ejecuta el JAR |
| `docker-compose.yml` | Servicios `postgres` + `backend` |

**Servicio PostgreSQL:**

- Imagen: `postgres:17`
- Base de datos: `monitoring`
- Contenedor: `monitoring-db`

**Servicio backend:**

- Puerto expuesto: `8080`
- Perfil Spring: `docker`
- Depende de PostgreSQL

**Ejecución (base):**

```bash
cd backend
docker compose up --build
```

API disponible en `http://localhost:8080`.

### Estructura inicial del backend

```
backend/
├── src/main/kotlin/com/monitoring/backend/
│   ├── BackendApplication.kt
│   ├── controllers/
│   │   └── ServerController.kt
│   ├── services/
│   │   └── ServerService.kt
│   ├── repositories/
│   │   ├── ServerRepository.kt
│   │   └── ServerHistoryRepository.kt
│   ├── models/
│   │   ├── Server.kt
│   │   ├── ServerStatus.kt
│   │   └── ServerHistory.kt
│   ├── dto/
│   │   ├── CreateServerRequest.kt
│   │   ├── UpdateServerRequest.kt
│   │   └── ServerResponse.kt
│   └── scheduler/
│       └── ServerMonitoringScheduler.kt
├── Dockerfile
├── docker-compose.yml
└── src/main/resources/
    ├── application.yaml
    └── application-docker.yml
```

---

## Fases 6–9 — extensiones del backend

| Fase | Descripción | Archivos principales |
|------|-------------|----------------------|
| **6 – Historial** | Guarda cada cambio de estado (`previousStatus` → `newStatus`) | `ServerHistoryService`, `ServerHistoryController`, `ServerHistoryResponse` |
| **7 – WebSocket** | Alertas en tiempo real al frontend | `WebSocketConfig`, `AlertService`, `AlertMessage` |
| **8 – Telegram** | Notificación externa cuando un servidor cae o se recupera | `TelegramService` |
| **9 – Dashboard** | Estadísticas agregadas | `DashboardService`, `DashboardController`, `DashboardResponse` |

El scheduler ahora, ante un cambio de estado:

1. Guarda el evento en historial
2. Envía alerta por WebSocket
3. Notifica por Telegram (si está configurado)

### Nuevos endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/history` | Historial completo de cambios |
| GET | `/api/history/{serverId}` | Historial de un servidor |
| GET | `/api/dashboard` | Estadísticas (total, online, offline, disponibilidad %) |

**Respuesta del dashboard (`DashboardResponse`):**

```json
{
  "totalServers": 5,
  "onlineServers": 3,
  "offlineServers": 1,
  "availabilityPercentage": 60.0
}
```

> Los servidores en estado `UNKNOWN` cuentan en el total pero no en online ni offline.

---

## WebSocket (alertas en tiempo real)

- **Endpoint STOMP:** `/ws` (SockJS habilitado)
- **Topic:** `/topic/alerts`

Payload (`AlertMessage`):

```json
{
  "serverName": "Google",
  "previousStatus": "ONLINE",
  "currentStatus": "OFFLINE",
  "timestamp": "2026-06-03T15:30:00"
}
```

El frontend debe conectarse desde el origen configurado en `FRONTEND_ORIGIN` (por defecto `http://localhost:5173`).

---

## Telegram

### 1. Crear bot

1. En Telegram, abrir **@BotFather**
2. Enviar `/newbot` y seguir los pasos
3. Guardar el token que entrega BotFather

### 2. Obtener Chat ID

- Opción rápida: usar **@userinfobot** y copiar tu ID numérico
- Opción manual: enviar un mensaje al bot y consultar  
  `https://api.telegram.org/bot<TOKEN>/getUpdates`

### 3. Variables de entorno

```env
TELEGRAM_BOT_TOKEN=7123456789:AAHxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TELEGRAM_CHAT_ID=123456789
```

Si no están configuradas, el backend funciona igual pero **no envía** mensajes a Telegram.

### Mensajes enviados

- Servidor cae: `Servidor {nombre} cayó a las HH:mm`
- Servidor recuperado: `Servidor {nombre} volvió a estar ONLINE a las HH:mm`

---

## Variables de entorno

| Variable | Descripción | Default (Docker) |
|----------|-------------|------------------|
| `API_KEY` | Clave para header `X-API-Key` | `changeme-in-production` |
| `POSTGRES_PASSWORD` | Contraseña de PostgreSQL | `admin` |
| `FRONTEND_ORIGIN` | Origen permitido (CORS + WebSocket) | `http://localhost:5173` |
| `TELEGRAM_BOT_TOKEN` | Token del bot de Telegram | (vacío) |
| `TELEGRAM_CHAT_ID` | ID del chat destino | (vacío) |

**Importante:** no subir tokens ni contraseñas al repositorio. Usar un archivo `.env` local (gitignored) o secrets del entorno de despliegue.

---

## Autenticación de la API

Todas las rutas bajo `/api/**` requieren el header `X-API-Key` cuando la variable `API_KEY` está configurada.

```http
GET http://localhost:8080/api/servers
X-API-Key: tu-clave-segura
```

---

## Ejecución con Docker

Desde la carpeta `backend/`:

```bash
docker compose up --build
```

Backend disponible en `http://localhost:8080`.

Ejemplo de `.env` en `backend/`:

```env
API_KEY=clave-segura-de-produccion
POSTGRES_PASSWORD=password-seguro
TELEGRAM_BOT_TOKEN=tu-token
TELEGRAM_CHAT_ID=tu-chat-id
FRONTEND_ORIGIN=http://localhost:5173
```

---

## Seguridad

Medidas añadidas sobre la base del proyecto para reducir riesgos en revisión QA / ingeniería:

| Medida | Detalle |
|--------|---------|
| **API Key** | Filtro en `/api/**` exige header `X-API-Key` cuando `API_KEY` está definida |
| **Anti-SSRF** | Solo URLs `http`/`https` hacia hosts públicos; bloqueo de IPs privadas, loopback y metadata cloud |
| **Validación de entrada** | `@Valid`, `@NotBlank`, `@Size`, `@Pattern` en DTOs de servidores |
| **Rate limiting** | Límite en POST, PUT y DELETE (30 req / 60 s por IP) |
| **CORS restringido** | Solo el origen configurado en `FRONTEND_ORIGIN` |
| **Errores controlados** | `@RestControllerAdvice` con respuestas 400/404 sin stack trace |
| **SQL oculto en logs** | `show-sql: false` en perfil docker |
| **PostgreSQL no expuesto** | Puerto 5432 no publicado al host en docker-compose |
| **Credenciales por env** | DB, API key y Telegram fuera del código fuente |
| **Redirects deshabilitados** | El scheduler no sigue redirecciones HTTP automáticas |

Archivos de seguridad en `security/`:

- `UrlValidator.kt` — validación anti-SSRF
- `ApiKeyAuthFilter.kt` — autenticación por API key
- `RateLimitFilter.kt` — límite de peticiones de escritura

### Recomendaciones para producción

- Cambiar `API_KEY` y `POSTGRES_PASSWORD` por valores fuertes
- No commitear `.env` ni tokens de Telegram
- Mantener el backend en una red Docker interna con PostgreSQL
- Usar HTTPS delante del API (reverse proxy)

---

## Estructura completa del backend (actual)

```
backend/
├── src/main/kotlin/com/monitoring/backend/
│   ├── BackendApplication.kt
│   ├── controllers/
│   │   ├── ServerController.kt          # base
│   │   ├── ServerHistoryController.kt     # fase 6
│   │   ├── DashboardController.kt         # fase 9
│   │   └── GlobalExceptionHandler.kt      # seguridad
│   ├── services/
│   │   ├── ServerService.kt               # base
│   │   ├── ServerHistoryService.kt        # fase 6
│   │   ├── AlertService.kt                # fase 7
│   │   ├── TelegramService.kt             # fase 8
│   │   └── DashboardService.kt            # fase 9
│   ├── repositories/
│   │   ├── ServerRepository.kt            # base
│   │   └── ServerHistoryRepository.kt     # base + fase 6
│   ├── models/
│   │   ├── Server.kt                      # base
│   │   ├── ServerStatus.kt                # base
│   │   └── ServerHistory.kt               # base (completado fase 6)
│   ├── dto/                               # base + fases 6–9
│   ├── config/
│   │   ├── WebSocketConfig.kt             # fase 7
│   │   └── CorsConfig.kt                  # seguridad
│   ├── security/                          # seguridad
│   ├── exceptions/                        # seguridad
│   └── scheduler/
│       └── ServerMonitoringScheduler.kt   # base + fases 6–8
├── Dockerfile
├── docker-compose.yml
└── src/main/resources/
    ├── application.yaml
    └── application-docker.yml
```

---

## Pendiente — Fase 10 (otro integrante)

- Crear carpeta `frontend/`
- Mover `docker-compose.yml` a la raíz del monorepo
- Levantar **postgres + backend + frontend** juntos
- Frontend debe consumir:
  - `GET /api/servers`
  - `GET /api/history`
  - `GET /api/dashboard`
  - Alertas WebSocket en `/topic/alerts`

Estructura final esperada:

```
monitoring-system/
├── backend/
├── frontend/
└── docker-compose.yml
```

---

## Historial de commits (referencia)

| Commit | Descripción |
|--------|-------------|
| Base inicial | Proyecto Spring Boot, CRUD, modelos, repositorios |
| Docker y PostgreSQL | `Dockerfile`, `docker-compose.yml`, perfiles de configuración |
| Monitoreo automático | Scheduler cada 30 s, estados ONLINE/OFFLINE |
| Fases 6–9 + seguridad | Historial, WebSocket, Telegram, dashboard, endurecimiento |
