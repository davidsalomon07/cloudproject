# INFORME DE EJECUCIÓN DB — MicroCheck

**Responsable:** Leonardo Falconí (DBA)  
**Fecha:** 2026-06-06  
**Metodología:** Cambio → Validación → Corrección → Revalidación → Siguiente cambio

---

## RESUMEN DE EJECUCIÓN DB

Se implementó el módulo completo de Base de Datos para MicroCheck siguiendo el plan incremental de 8 pasos. PostgreSQL 17 queda gobernado por scripts SQL del DBA, con volumen persistente, seeds demo, integridad referencial (FK CASCADE, CHECK), índices de consulta, credenciales unificadas vía `.env` y Hibernate en modo `validate`. Todas las validaciones ejecutadas pasaron exitosamente.

---

## TAREAS DE BASE DE DATOS COMPLETADAS

| Paso | Tarea | Validación |
|---|---|---|
| 1 | `database/init/01-schema.sql` | Contenedor temporal: tablas, FK, índices OK |
| 2 | Montaje init en `docker-compose.yml` (solo postgres) | Healthcheck healthy, esquema en `monitoring` |
| 3 | `database/init/02-seed.sql` | 3 filas demo tras `down -v` |
| 4 | `database/scripts/apply_constraints.sql` | Legacy simulado, idempotente |
| 5 | `application-docker.yml` | Backend Started, HikariPool OK, sin SchemaValidationException |
| 6 | Pruebas integridad | FK CASCADE, CHECK, persistencia OK |
| 7 | Documentación `docs/database/` | Alineada a esquema real |
| 8 | Informe final | Este documento |

---

## ARCHIVOS DB MODIFICADOS / CREADOS

| Archivo | Acción |
|---|---|
| `database/init/01-schema.sql` | Creado |
| `database/init/02-seed.sql` | Creado |
| `database/scripts/apply_constraints.sql` | Creado |
| `docker-compose.yml` | Modificado (solo servicio postgres: volumen init) |
| `backend/src/main/resources/application-docker.yml` | Modificado (datasource + validate) |
| `docs/database/DISEÑO_BD.md` | Creado |
| `docs/database/PRUEBA_PERSISTENCIA.md` | Creado |
| `docs/database/CREDENCIALES.md` | Creado |
| `docs/database/INFORME_EJECUCION_DB.md` | Creado |

---

## CAMBIOS DE CONEXIÓN O CONFIGURACIÓN REALIZADOS

- `application-docker.yml`: `SPRING_DATASOURCE_*` desde variables de entorno; eliminado `POSTGRES_PASSWORD:admin`.
- `ddl-auto`: `update` → `validate`.
- Dialecto explícito: `org.hibernate.dialect.PostgreSQLDialect`.
- Flujo credenciales: `.env` → compose → `SPRING_DATASOURCE_*` → HikariCP.

---

## VALIDACIONES DE INTEGRIDAD EJECUTADAS

| Prueba | Evidencia |
|---|---|
| FK CASCADE | DELETE servidor → history_after = 0 |
| CHECK constraint | INSERT status INVALID → error chk_servers_status |
| Persistencia | 3 filas antes/después de `docker restart monitoring-db` |
| Backend validate | Started BackendApplicationKt, HikariPool-1 Start completed |
| Script idempotente | Segunda ejecución apply_constraints.sql sin error |

---

## CUMPLIMIENTO DE RÚBRICA (SOLO DB)

| Criterio PMV/Rúbrica | Estado |
|---|---|
| Tablas diseñadas (1-2 sencillas) | Cumple — `servers`, `server_history` |
| Credenciales vía `.env` | Cumple — no en código |
| Volumen persistente | Cumple — `postgres_data` |
| Scripts SQL | Cumple — init + apply_constraints |
| Sustentación (comandos auditoría) | Cumple — documentado en PRUEBA_PERSISTENCIA.md |

**Puntuación esperada rol DBA (criterio 3):** 2/2 — *"DBA con volúmenes persistentes y scripts"*

---

## TAREAS EXCLUIDAS POR NO PERTENECER AL ROL DB

- Fix nginx frontend / proxy API
- Modificación entidades JPA Kotlin
- ServerService.deleteServer() cascade en backend
- Rate limiting, API Key, CORS (QA)
- README general, start-project scripts
- Flyway en Gradle
- application-dev-pg.yml (opcional P1)

---

## PENDIENTES DEL MÓDULO DB

| Pendiente | Prioridad | Nota |
|---|---|---|
| `application-dev-pg.yml` | P1 opcional | Perfil dev local con PostgreSQL |
| Coordinación DevOps | Info | Solo se modificó bloque postgres en compose |

---

## RESULTADO FINAL

**Módulo DB completado y validado.** PostgreSQL operativo con esquema versionado en SQL, listo para sustentación oral con comandos de auditoría documentados.
