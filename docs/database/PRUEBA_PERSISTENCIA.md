# Prueba de Persistencia — PostgreSQL MicroCheck

**DBA:** Leonardo Falconí  
**Validado:** 2026-06-06

---

## Prerrequisitos

- Docker Desktop en ejecución
- Repositorio en raíz: `cloudproject/`
- Archivo `.env` con variables `DB_NAME`, `DB_USER`, `DB_PASSWORD`

---

## 1. Inicialización limpia

```powershell
cd c:\Users\Public\Desktop\Repositorios\cloudproject
docker compose down -v
docker compose up -d postgres
```

Esperar healthcheck `healthy`:

```powershell
docker compose ps
```

---

## 2. Verificar esquema e init scripts

```powershell
docker exec monitoring-db psql -U postgres -d monitoring -c "\dt"
docker exec monitoring-db psql -U postgres -d monitoring -c "\d+ server_history"
```

**Resultado esperado:**
- Tablas `servers` y `server_history`
- FK `fk_history_server` con `ON DELETE CASCADE`
- Índices `idx_server_history_*`

---

## 3. Verificar seeds demo

```powershell
docker exec monitoring-db psql -U postgres -d monitoring -c "SELECT id, name, url, status FROM servers;"
```

**Resultado esperado:** 3 filas (HTTPBin OK, Example.com, Google).

---

## 4. Verificar backend con ddl-auto=validate

```powershell
docker compose up -d --build backend
docker compose logs backend | Select-String "HikariPool|Started BackendApplication|SchemaValidationException"
```

**Resultado esperado:**
- `HikariPool-1 - Start completed`
- `Started BackendApplicationKt`
- Sin `SchemaValidationException`

---

## 5. Prueba FK CASCADE

```powershell
docker exec monitoring-db psql -U postgres -d monitoring -c "INSERT INTO servers (name, url, status) VALUES ('test-cascade','https://example.com/test-cascade','UNKNOWN');"
docker exec monitoring-db psql -U postgres -d monitoring -c "INSERT INTO server_history (server_id, previous_status, new_status, timestamp) SELECT id, 'UNKNOWN', 'OFFLINE', NOW() FROM servers WHERE url = 'https://example.com/test-cascade';"
docker exec monitoring-db psql -U postgres -d monitoring -c "DELETE FROM servers WHERE url = 'https://example.com/test-cascade';"
docker exec monitoring-db psql -U postgres -d monitoring -c "SELECT COUNT(*) FROM server_history WHERE server_id NOT IN (SELECT id FROM servers);"
```

**Resultado esperado:** `COUNT = 0` (historial huérfano eliminado en cascada).

---

## 6. Prueba CHECK constraint

```powershell
docker exec monitoring-db psql -U postgres -d monitoring -c "INSERT INTO servers (name, url, status) VALUES ('bad','https://x.com/bad','INVALID');"
```

**Resultado esperado:** Error `violates check constraint "chk_servers_status"`.

---

## 7. Prueba de persistencia tras reinicio

```powershell
docker exec monitoring-db psql -U postgres -d monitoring -t -A -c "SELECT COUNT(*) FROM servers;"
docker restart monitoring-db
# Esperar ~6 segundos
docker exec monitoring-db psql -U postgres -d monitoring -t -A -c "SELECT COUNT(*) FROM servers;"
docker volume inspect cloudproject_postgres_data
```

**Resultado esperado:** Mismo conteo antes y después del restart. Volumen `cloudproject_postgres_data` montado en `/var/lib/postgresql/data`.

---

## 8. Script legacy (volúmenes sin FK)

Para volúmenes creados antes de los scripts DBA:

```powershell
docker cp database/scripts/apply_constraints.sql monitoring-db:/tmp/apply_constraints.sql
docker exec monitoring-db psql -U postgres -d monitoring -f /tmp/apply_constraints.sql
```

Ejecutar dos veces — debe ser idempotente (sin errores en segunda ejecución).

---

## Evidencia de ejecución (2026-06-06)

| Prueba | Resultado |
|---|---|
| Init scripts | OK — tablas + FK + índices |
| Seeds | OK — 3 filas |
| Backend validate | OK — Started sin SchemaValidationException |
| FK CASCADE | OK — history_after = 0 |
| CHECK constraint | OK — INSERT INVALID rechazado |
| Persistencia restart | OK — 3 filas antes y después |
