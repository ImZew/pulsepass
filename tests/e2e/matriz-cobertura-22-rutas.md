# Matriz de cobertura — 22 rutas × actores

Generada a partir del catálogo de la colección. Cada ruta tiene al menos un caso nominal; los demás casos cubren denegaciones, propiedad y errores.

| Ruta | Casos (ID) | Actores probados | Nominal |
|---|---|---|---|
| `GET /api/venues/{code}` | E2E-VEN-01, E2E-VEN-01N | ANON | E2E-VEN-01 |
| `GET /api/venues/active` | E2E-VEN-02 | ANON | E2E-VEN-02 |
| `POST /api/events` | TC-SEC-001a, TC-SEC-001b, TC-SEC-001c, E2E-EVT-01, E2E-EVT-01D, E2E-EVT-01V, E2E-EVT-01P, E2E-EVT-01I, TC-HTTP-06, TC-HTTP-07, TC-HTTP-13, TC-HTTP-14 | ANON, USER_A, STAFF, ADMIN | E2E-EVT-01 |
| `GET /api/events/{eventCode}` | E2E-EVT-02, TC-SEC-004, E2E-EVT-02N, TC-SEC-001d, TC-SEC-002d, TC-SEC-003d, E2E-EVT-02A, TC-SEC-015a, TC-SEC-015b, E2E-EVT-05V, E2E-EVT-04V | ANON, STAFF, ADMIN | E2E-EVT-02 |
| `GET /api/events/published` | E2E-EVT-03a, TC-AUTH-015, E2E-EVT-03b, E2E-EVT-03c | ANON | E2E-EVT-03a |
| `PATCH /api/events/{eventCode}/publish` | TC-SEC-002a, TC-SEC-002b, TC-SEC-002c, E2E-EVT-04, E2E-EVT-04D, E2E-EVT-04N | ANON, USER_A, STAFF, ADMIN | E2E-EVT-04 |
| `POST /api/events/{eventCode}/artists/{artistId}` | TC-SEC-003a, TC-SEC-003b, TC-SEC-003c, E2E-EVT-05, E2E-EVT-05D, E2E-EVT-05N, E2E-EVT-05M | ANON, USER_A, STAFF, ADMIN | E2E-EVT-05 |
| `GET /api/events/by-artist?stageName=` | E2E-EVT-06, E2E-EVT-06b, E2E-EVT-06c | ANON, ADMIN | E2E-EVT-06 |
| `GET /api/artists/{id}` | E2E-ART-01, E2E-ART-01N | ANON | E2E-ART-01 |
| `GET /api/artists/by-stage-name?stageName=` | E2E-ART-02, E2E-ART-02N | ANON | E2E-ART-02 |
| `GET /api/artists/active` | E2E-ART-03 | ANON | E2E-ART-03 |
| `POST /api/users` | E2E-USR-01A, E2E-USR-01B, TC-SEC-016a, TC-BIZ-006a, TC-BIZ-006b, TC-HTTP-01, TC-HTTP-02, TC-HTTP-03, TC-HTTP-04 | ANON | E2E-USR-01A |
| `GET /api/users/by-email?email=` | E2E-USR-02, E2E-USR-02M, TC-SEC-006, TC-SEC-007S, TC-SEC-007N | ANON, USER_A, USER_B, STAFF, ADMIN | E2E-USR-02 |
| `GET /api/users/{username}` | E2E-USR-03, E2E-USR-03M, TC-SEC-007, TC-SEC-007U, TC-SEC-007X, E2E-USR-03N | ANON, USER_A, USER_B, ADMIN | E2E-USR-03 |
| `POST /api/tickets` | TC-BIZ-007a, TC-BIZ-007b, TC-BIZ-007c, TC-SEC-008a, TC-SEC-008N, TC-SEC-008S, TC-SEC-008M, E2E-TKT-01B, TC-HTTP-08, TC-HTTP-09, TC-HTTP-10, TC-HTTP-11, TC-HTTP-12 | ANON, USER_A, USER_B, STAFF, ADMIN | TC-BIZ-007a |
| `GET /api/tickets/{ticketCode}` | E2E-TKT-02, E2E-TKT-02S, E2E-TKT-02M, TC-SEC-009, TC-SEC-011c, TC-SEC-009N, TC-SEC-009B, TC-BIZ-010V, TC-BIZ-012V, E2E-TKT-05V, E2E-TKT-02N, E2E-TKT-02X | ANON, USER_A, USER_B, STAFF, ADMIN | E2E-TKT-02 |
| `GET /api/tickets/by-user?email=` | E2E-TKT-03a, E2E-TKT-03b, E2E-TKT-03c, E2E-TKT-03M, TC-SEC-008b, TC-SEC-010, TC-SEC-010N, E2E-TKT-03d | ANON, USER_A, USER_B, ADMIN | E2E-TKT-03a |
| `GET /api/events/{eventCode}/tickets/paid` | E2E-TKT-04, E2E-TKT-04M, TC-SEC-013, TC-SEC-013N, TC-BIZ-009b, TC-SEC-017 | ANON, USER_A, STAFF, ADMIN | E2E-TKT-04 |
| `PATCH /api/tickets/{ticketCode}/cancel` | TC-SEC-011a, TC-SEC-011b, TC-SEC-011N, E2E-TKT-05, TC-BIZ-011, E2E-TKT-05U, E2E-TKT-05M, E2E-TKT-05N | ANON, USER_A, USER_B, STAFF, ADMIN | E2E-TKT-05 |
| `PATCH /api/tickets/{ticketCode}/use` | TC-SEC-012a, TC-SEC-012b, TC-SEC-012N, TC-BIZ-012a, E2E-TKT-06, TC-BIZ-013, E2E-TKT-06N | ANON, USER_A, USER_B, STAFF | E2E-TKT-06 |
| `POST /api/auth/login` | E2E-AUTH-01, TC-AUTH-003, E2E-AUTH-01B, E2E-AUTH-01S, E2E-AUTH-01M, E2E-AUTH-01C, TC-AUTH-004, TC-AUTH-005, TC-HTTP-05, TC-AUTH-013b | ANON | E2E-AUTH-01 |
| `GET /api/auth/me` | E2E-AUTH-02, E2E-AUTH-02B, E2E-AUTH-02S, E2E-AUTH-02M, TC-SEC-016b, TC-AUTH-007, TC-AUTH-008a, TC-AUTH-008b, TC-AUTH-009, TC-AUTH-011a, TC-AUTH-011b, TC-AUTH-012, TC-AUTH-010, TC-AUTH-013a | ANON, USER_A, USER_B, STAFF, ADMIN, USER_C, INACTIVE_USER | E2E-AUTH-02 |

Total: 22/22 rutas (20 de negocio + login + me). Casos en la colección: 151 (sin contar la ancla FLUJOS-00).

## Casos del PRD sin petición propia

| Caso PRD | Motivo |
|---|---|
| TC-AUTH-011 (issuer distinto) | Requiere firmar con la clave real de la app. Cubierto por `JwtServiceTest.wrongIssuer_IsRejected`. |
| TC-BIZ-014 (aforo agotado, edad insuficiente) | El `TicketServiceImpl` actual no implementa esas reglas; solo valida fecha pasada (TC-HTTP-11) y se prueba el estado no publicado (TC-HTTP-12). |
| TC-AUTH-014 | Cubierto por TC-SEC-001b (USER en ruta ADMIN). |
