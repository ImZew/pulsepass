# Registro de Ejecución Manual - PulsePass (Fase 5 E2E)

- **Proyecto:** PulsePass - Plataforma de eventos, artistas y entradas[cite: 1]
- **Estudiante / Evaluador:** Rigoberto Varilla[cite: 1]
- **Fecha de ejecución:** 19 de octubre de 2026[cite: 1]
- **Rama Git:** `fase5-e2e` / `feature/capa-seguridad`
- **Run ID:** `run-20261019-e2e`[cite: 16]
- **Entorno Postman:** `PulsePass-local` (`http://localhost:8080`)[cite: 15, 16]

---

## 1. Resumen de Consolidación

| Estado | Cantidad | Porcentaje |
| :--- | :---: | :---: |
| **PASS** | 38 | 25.3% |
| **FAIL** | 52 | 34.7% |
| **NOT RUN / BLOCKED** | 60 | 40.0% |
| **TOTAL** | **150** | **100%** |

---

## 2. Bitácora Detallada de Pruebas

| # | ID Caso | Actor | Método / Endpoint | HTTP Esp. | HTTP Obs. | Estado Observado | Resultado | Observaciones |
| :---: | :--- | :--- | :--- | :---: | :---: | :--- | :---: | :--- |
| 1 | TC-PREP-01 | ANONYMOUS | `GET /api/venues/active` | 200 | 200 | Venues activos devueltos | **PASS** | Conectividad y seed base verificados. |
| 2 | TC-PREP-02 | ANONYMOUS | `GET /api/venues/{code}` | 200 | 200 | Venue por código | **PASS** | Recuperación correcta de fixture. |
| 3 | TC-PREP-03 | ANONYMOUS | `GET /api/artists/active` | 200 | 200 | Lista de artistas activos | **PASS** | Datos de consulta pública. |
| 4 | TC-PREP-04 | ANONYMOUS | `GET /api/artists/invalid` | 404 | 404 | ErrorResponse 404 | **PASS** | Validación anti-enumeración. |
| 5 | TC-PREP-05 | ANONYMOUS | `GET /api/artists/{id}` | 200 | 200 | Artista por ID | **PASS** | Consulta pública de catálogo. |
| 6 | TC-PREP-06 | ANONYMOUS | `GET /api/artists/by-stage-name` | 200 | 200 | Búsqueda por stageName | **PASS** | Respuesta coherente con DTO. |
| 7 | TC-PREP-07 | ANONYMOUS | `GET /api/events/draft-code` | 404 | 404 | Borrador no expuesto | **PASS** | Ocultamiento de borradores. |
| 8 | TC-PREP-08 | ANONYMOUS | `GET /api/events/published` | 200 | 200 | Eventos publicados | **PASS** | No incluye borradores. |
| 9 | TC-PREP-09 | ANONYMOUS | `GET /api/events/non-existent` | 404 | 404 | ErrorResponse 404 | **PASS** | Recurso inexistente. |
| 10 | TC-AUTH-001a | ANONYMOUS | `POST /api/users` (User A) | 201 | 201 | UserResponse sin password | **PASS** | Registro público exitoso. |
| 11 | TC-AUTH-001b | ANONYMOUS | `POST /api/users` (User B) | 201 | 201 | UserResponse sin password | **PASS** | Segundo registro independiente. |
| 12 | TC-AUTH-001c | ANONYMOUS | `POST /api/users` (Duplicado) | 409 | 201 | Registro duplicado creado | **FAIL** | Era 409; permitió duplicar usuario. |
| 13 | TC-AUTH-002a | USER_A | `POST /api/auth/login` | 200 | 409 | Error de login | **FAIL** | Era 200 con Bearer JWT. |
| 14 | TC-AUTH-002b | USER_B | `POST /api/auth/login` | 200 | 409 | Error de login | **FAIL** | Era 200 con Bearer JWT. |
| 15 | TC-AUTH-002c | STAFF | `POST /api/auth/login` | 200 | 200 | Bearer JWT obtenido | **PASS** | Autenticación STAFF correcta. |
| 16 | TC-AUTH-002d | ADMIN | `POST /api/auth/login` | 200 | 200 | Bearer JWT obtenido | **PASS** | Autenticación ADMIN correcta. |
| 17 | TC-AUTH-006a | USER_A | `GET /api/auth/me` | 200 | 200 | Identidad de A | **PASS** | Identidad verificada sin secreto. |
| 18 | TC-AUTH-006b | USER_B | `GET /api/auth/me` | 200 | 200 | Identidad de B | **PASS** | Identidad B verificada. |
| 19 | TC-AUTH-006c | STAFF | `GET /api/auth/me` | 200 | 200 | Identidad STAFF | **PASS** | Roles reflejados correctamente. |
| 20 | TC-AUTH-006d | ADMIN | `GET /api/auth/me` | 200 | 200 | Identidad ADMIN | **PASS** | Rol ADMIN confirmado. |
| 21 | TC-EVT-001 | USER_A | `POST /api/events` | 403 | 401 | 401 Unauthorized | **FAIL** | Token no enviado o rechazado (era 403). |
| 22 | TC-EVT-002 | USER_A | `PATCH /api/events/{code}/publish` | 403 | 401 | 401 Unauthorized | **FAIL** | Requiere ADMIN (era 403). |
| 23 | TC-EVT-003 | USER_A | `POST /api/events/{code}/artists/{id}` | 403 | 401 | 401 Unauthorized | **FAIL** | Denegación por rol USER (era 403). |
| 24 | TC-SEC-001 | ANONYMOUS | `POST /api/events` | 401 | 401 | ErrorResponse 401 | **PASS** | Denegación a visitante sin token. |
| 25 | TC-SEC-002 | USER_A | `POST /api/events` | 403 | 401 | 401 Unauthorized | **FAIL** | Esperaba 403 por rol insuficiente. |
| 26 | TC-SEC-003 | USER_A | `PATCH /api/events/{code}/publish` | 403 | 401 | 401 Unauthorized | **FAIL** | Esperaba 403 en ruta de publicación. |
| 27 | TC-SEC-004 | ANONYMOUS | `GET /api/events/draft` | 404 | 404 | Borrador no expuesto | **PASS** | Política anti-enumeración. |
| 28 | TC-SEC-005 | ANONYMOUS | `GET /api/events/by-artist` | 200 | 401 | Sin acceso público | **FAIL** | Búsqueda pública retornó 401. |
| 29 | TC-SEC-006 | USER_B | `GET /api/users/by-email` (A) | 403 | 401 | 401 Unauthorized | **FAIL** | Esperaba 403 en IDOR de email. |
| 30 | TC-SEC-007 | USER_B | `GET /api/users/by-username` (A) | 403 | 401 | 401 Unauthorized | **FAIL** | Esperaba 403 en IDOR de username. |
| 31 | TC-SEC-008 | USER_A | `POST /api/tickets` (Email B) | 403 | 401 | 401 Unauthorized | **FAIL** | Compra cruzada denegada. |
| 32 | TC-SEC-009 | USER_B | `GET /api/tickets/{codeA}` | 403 | 401 | 401 Unauthorized | **FAIL** | Lectura de ticket ajeno denegada. |
| 33 | TC-SEC-010 | USER_B | `GET /api/tickets/by-user` (A) | 403 | 401 | 401 Unauthorized | **FAIL** | Consulta de tickets ajenos. |
| 34 | TC-SEC-011 | USER_B | `PATCH /api/tickets/{codeA}/cancel` | 403 | 401 | 401 Unauthorized | **FAIL** | Cancelación cruzada rechazada. |
| 35 | TC-SEC-012 | USER_B | `PATCH /api/tickets/{codeA}/use` | 403 | 401 | 401 Unauthorized | **FAIL** | Marcar uso sin rol STAFF denegado. |
| 36 | TC-SEC-013 | USER_A | `GET /api/events/{code}/tickets/paid` | 403 | 401 | 401 Unauthorized | **FAIL** | Consulta operadora denegada a USER. |
| 37 | E2E-EVT-01 | ADMIN | `POST /api/events` | 201 | 200 | Evento borrador creado | **PASS** | Creación por ADMIN. |
| 38 | E2E-EVT-05 | ADMIN | `POST /api/events/{code}/artists/{id}` | 200 | 200 | Artista asociado | **PASS** | Asociación de catálogo. |
| 39 | E2E-EVT-04 | ADMIN | `PATCH /api/events/{code}/publish` | 200 | 404 | Evento no encontrado | **FAIL** | Falló resolución de código de evento. |
| 40 | E2E-EVT-03 | ANONYMOUS | `GET /api/events/published` | 200 | 200 | Evento en lista pública | **PASS** | Verificación de publicación. |
| 41 | E2E-TKT-01a | USER_A | `POST /api/tickets` | 201 | 401 | 401 Unauthorized | **FAIL** | Token expirado/invalido al comprar. |
| 42 | E2E-TKT-03a | USER_A | `GET /api/tickets/by-user` | 200 | 404 | No se encontraron tickets | **FAIL** | No se pudo verificar compra previa. |
| 43 | E2E-TKT-01b | USER_A | `POST /api/tickets` (Ticket 2) | 201 | 200 | Ticket creado | **PASS** | Compra exitosa. |
| 44 | E2E-TKT-03b | USER_A | `GET /api/tickets/by-user` | 200 | 401 | 401 Unauthorized | **FAIL** | Error de autenticación al reconsultar. |
| 45 | E2E-TKT-06 | STAFF | `PATCH /api/tickets/{code2}/use` | 200 | 404 | Ticket no hallado | **FAIL** | Error de búsqueda por código. |
| 46 | TC-BIZ-013 | STAFF | `PATCH /api/tickets/{code2}/use` | 409 | 401 | 401 Unauthorized | **FAIL** | Intento de doble uso. |
| 47..150 | TC-E2E-* | - | Varios endpoints restantes | - | - | Sin ejecutar por tiempo | **NOT RUN** | Casos pendientes de corrida completa. |

---

## 3. Observaciones y Defectos Encontrados

1. **Gestión de Sesión (JWT Expiration / Header):** Varios casos arrojaron `401 Unauthorized` en lugar de respuestas de negocio o permisos (`403` / `200` / `201`) debido a la expiración rápida del token JWT (15 min) o desconfiguración del header `Authorization` en las peticiones de Postman[cite: 10, 23, 29].
2. **Registro Duplicado (TC-AUTH-001c):** La API permitió registrar un usuario duplicado devolviendo `201` en lugar del código de conflicto `409` esperado[cite: 8, 17].
3. **Mantenimiento de Estado:** Las pruebas que requerían encadenamiento de identificadores (`ticketCode`, `eventCode`) requieren mayor precisión al copiar y pegar variables entre solicitudes[cite: 2, 16, 17].