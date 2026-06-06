# Monitor de Servidores

Sistema de monitoreo de servidores en tiempo real con arquitectura de microservicios.

## 📋 Estructura del Proyecto

```
monitoring-system/
├── backend/           # API REST con Spring Boot + Kotlin
│   ├── src/
│   │   ├── main/      # Código fuente del backend
│   │   └── test/      # Pruebas unitarias y de integración
│   ├── build.gradle.kts
│   ├── Dockerfile
│   └── docker-compose.yml
├── frontend/          # Interfaz de usuario con React + Vite + Tailwind CSS 4
│   ├── src/
│   │   ├── components/ # Componentes React
│   │   ├── services/   # Servicios de API
│   │   ├── hooks/      # Hooks personalizados
│   │   └── types/      # Tipos TypeScript
│   └── package.json
└── README.md
```

## 🚀 Tecnologías

### Backend
- **Kotlin** 2.2.21 + Spring Boot 4.0.6
- **PostgreSQL** 17 (producción) / **H2** (pruebas)
- **WebSocket** con STOMP para alertas en tiempo real
- **JPA/Hibernate** para persistencia

### Frontend
- **React** 19 + **TypeScript** 5.8
- **Vite** 6 como bundler
- **Tailwind CSS** 4 para estilos
- **STOMP.js** + **SockJS** para WebSocket

## 🔒 Seguridad

- **Autenticación por API Key** con comparación en tiempo constante (anti timing attack)
- **Rate Limiting** por IP con ventana deslizante y cabeceras X-RateLimit
- **Anti-SSRF** validación de URLs con bloqueo de IPs privadas y locales
- **CORS** restringido al origen del frontend
- **Validación de entrada** con Jakarta Validation

## ⚙️ Configuración

### Prerrequisitos
- **Java** 21 JDK
- **Node.js** 18+
- **Docker** (opcional, para PostgreSQL)

### Ejecución Local

#### 1. Iniciar base de datos (Docker)
```bash
cd backend
docker compose up -d postgres
```

#### 2. Iniciar backend
```bash
cd backend
./gradlew bootRun
```

#### 3. Iniciar frontend
```bash
cd frontend
npm install
npm run dev
```

La aplicación estará disponible en:
- **Frontend:** http://localhost:5173
- **API:** http://localhost:8080

### Variables de Entorno

| Variable | Descripción | Valor por defecto |
|---|---|---|
| `API_KEY` | Clave para autenticación de API | (opcional) |
| `FRONTEND_ORIGIN` | Origen permitido para CORS | http://localhost:5173 |
| `POSTGRES_PASSWORD` | Contraseña de PostgreSQL | admin |
| `TELEGRAM_BOT_TOKEN` | Token del bot de Telegram | (opcional) |
| `TELEGRAM_CHAT_ID` | ID del chat de Telegram | (opcional) |

## 🧪 Pruebas

```bash
cd backend
./gradlew test
```

Las pruebas utilizan **H2 en memoria** con el perfil `test`, evitando dependencia de PostgreSQL.

## 📡 API REST

### Dashboard
- `GET /api/dashboard` — Resumen del estado de servidores

### Servidores
- `GET /api/servers` — Listar todos los servidores
- `GET /api/servers/{id}` — Obtener servidor por ID
- `POST /api/servers` — Crear servidor
- `PUT /api/servers/{id}` — Actualizar servidor
- `DELETE /api/servers/{id}` — Eliminar servidor

### Historial
- `GET /api/history` — Historial completo de cambios
- `GET /api/history/{serverId}` — Historial por servidor

### WebSocket
- `GET /ws` — Endpoint STOMP para alertas en tiempo real
- Suscripción: `/topic/alerts`

## 📦 Despliegue

```bash
cd backend
docker compose up --build
```

Esto inicia PostgreSQL y el backend. El frontend puede servirse mediante Nginx o Vite Preview.

## 📄 Licencia

MIT
