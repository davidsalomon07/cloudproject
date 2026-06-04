# Sistema de Monitoreo de Servidores

Backend Spring Boot (Kotlin) para monitorear servidores HTTP, registrar cambios de estado, enviar alertas en tiempo real y notificaciones por Telegram.

Repositorio: [github.com/davidsalomon07/cloudproject](https://github.com/davidsalomon07/cloudproject)

## Estado del proyecto

### Ya implementado (base)

- Arquitectura por capas: Controller → Service → Repository → Model
- PostgreSQL + JPA (Hibernate)
- CRUD de servidores (`/api/servers`)
- Scheduler automático cada 30 segundos (estados ONLINE / OFFLINE / UNKNOWN)
- Docker y docker-compose en `backend/`

### Fases 6–9 (backend)

| Fase | Descripción |
|------|-------------|
| **6 – Historial** | Registro de cada cambio de estado en `server_history` |
| **7 – WebSocket** | Alertas en tiempo real vía STOMP (`/topic/alerts`) |
| **8 – Telegram** | Notificaciones cuando un servidor cae o vuelve a ONLINE |
| **9 – Dashboard** | Estadísticas agregadas de servidores |

### Pendiente (otro integrante)

- Frontend
- `docker-compose.yml` en la raíz del monorepo (`backend/` + `frontend/`)
- Integración final frontend ↔ backend

---

## Endpoints REST

Todas las rutas bajo `/api/**` requieren el header `X-API-Key` cuando la variable `API_KEY` está configurada.

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/servers` | Listar servidores |
| GET | `/api/servers/{id}` | Obtener servidor |
| POST | `/api/servers` | Crear servidor |
| PUT | `/api/servers/{id}` | Actualizar servidor |
| DELETE | `/api/servers/{id}` | Eliminar servidor |
| GET | `/api/history` | Historial completo de cambios |
| GET | `/api/history/{serverId}` | Historial de un servidor |
| GET | `/api/dashboard` | Estadísticas (total, online, offline, disponibilidad %) |

### Ejemplo de petición

```http
GET http://localhost:8080/api/servers
X-API-Key: tu-clave-segura
```

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

Medidas implementadas en el backend para reducir riesgos en revisión QA / ingeniería:

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

### Recomendaciones para producción

- Cambiar `API_KEY` y `POSTGRES_PASSWORD` por valores fuertes
- No commitear `.env` ni tokens de Telegram
- Mantener el backend en una red Docker interna con PostgreSQL
- Usar HTTPS delante del API (reverse proxy)

---

## Estructura del backend

```
backend/
├── src/main/kotlin/com/monitoring/backend/
│   ├── controllers/     # REST + GlobalExceptionHandler
│   ├── services/        # Lógica de negocio, alertas, Telegram
│   ├── repositories/    # JPA
│   ├── models/          # Entidades
│   ├── dto/             # Request/Response
│   ├── config/          # WebSocket, CORS
│   ├── security/        # API key, rate limit, validación URL
│   └── scheduler/       # Monitoreo cada 30 s
├── docker-compose.yml
├── Dockerfile
└── src/main/resources/
    ├── application.yaml
    └── application-docker.yml
```

---

## Tecnologías

- Kotlin 2.2
- Spring Boot 4
- Spring Data JPA
- PostgreSQL 17
- WebSocket (STOMP)
- Docker
