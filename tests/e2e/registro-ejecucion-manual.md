# Registro de ejecución manual — PulsePass E2E

> Complete una fila por cada **Send**. No pegue tokens, contraseñas ni datos personales reales.
> **PASS**: HTTP, JSON y condición de negocio/seguridad coinciden. **FAIL**: algo no coincide o hay un 500 inesperado. **BLOCKED**: falta un prerrequisito (fixture, token, ID previo). **NOT RUN**: aún no ejecutado.

| Campo | Valor |
|---|---|
| Fecha de sesión | |
| Responsable | |
| runId | |
| Commit / rama probada | |
| Base de datos | pulsepass_e2e |

## Resultados por caso

| # | Caso | Actor | Método y ruta | HTTP esperado | HTTP observado | JSON / estado observado | Resultado | Evidencia / observación |
|---|---|---|---|---|---|---|---|---|
| 1 | PREP-01 | ANON | `GET /api/venues/active` | 200 | | | NOT RUN | |
| 2 | E2E-VEN-02 | ANON | `GET /api/venues/active` | 200 | | | NOT RUN | |
| 3 | E2E-VEN-01 | ANON | `GET /api/venues/{…}` | 200 | | | NOT RUN | |
| 4 | E2E-VEN-01N | ANON | `GET /api/venues/NO-EXISTE-{…}` | 404 | | | NOT RUN | |
| 5 | E2E-ART-03 | ANON | `GET /api/artists/active` | 200 | | | NOT RUN | |
| 6 | E2E-ART-01 | ANON | `GET /api/artists/{…}` | 200 | | | NOT RUN | |
| 7 | E2E-ART-01N | ANON | `GET /api/artists/999999999` | 404 | | | NOT RUN | |
| 8 | E2E-ART-02 | ANON | `GET /api/artists/by-stage-name?stageName=…` | 200 | | | NOT RUN | |
| 9 | E2E-ART-02N | ANON | `GET /api/artists/by-stage-name?stageName=…` | 404 | | | NOT RUN | |
| 10 | E2E-EVT-03a | ANON | `GET /api/events/published` | 200 | | | NOT RUN | |
| 11 | E2E-EVT-02 | ANON | `GET /api/events/{…}` | 200 | | | NOT RUN | |
| 12 | TC-SEC-004 | ANON | `GET /api/events/{…}` | 404 | | | NOT RUN | |
| 13 | E2E-EVT-02N | ANON | `GET /api/events/NO-EXISTE-{…}` | 404 | | | NOT RUN | |
| 14 | E2E-EVT-06 | ANON | `GET /api/events/by-artist?stageName=…` | 200 | | | NOT RUN | |
| 15 | E2E-USR-01A | ANON | `POST /api/users` | 201 | | | NOT RUN | |
| 16 | E2E-USR-01B | ANON | `POST /api/users` | 201 | | | NOT RUN | |
| 17 | TC-SEC-016a | ANON | `POST /api/users` | 201 | | | NOT RUN | |
| 18 | TC-BIZ-006a | ANON | `POST /api/users` | 409 | | | NOT RUN | |
| 19 | TC-BIZ-006b | ANON | `POST /api/users` | 409 | | | NOT RUN | |
| 20 | E2E-AUTH-01 | ANON | `POST /api/auth/login` | 200 | | | NOT RUN | |
| 21 | TC-AUTH-003 | ANON | `POST /api/auth/login` | 200 | | | NOT RUN | |
| 22 | E2E-AUTH-01B | ANON | `POST /api/auth/login` | 200 | | | NOT RUN | |
| 23 | E2E-AUTH-01S | ANON | `POST /api/auth/login` | 200 | | | NOT RUN | |
| 24 | E2E-AUTH-01M | ANON | `POST /api/auth/login` | 200 | | | NOT RUN | |
| 25 | E2E-AUTH-01C | ANON | `POST /api/auth/login` | 200 | | | NOT RUN | |
| 26 | E2E-AUTH-02 | USER_A | `GET /api/auth/me` | 200 | | | NOT RUN | |
| 27 | E2E-AUTH-02B | USER_B | `GET /api/auth/me` | 200 | | | NOT RUN | |
| 28 | E2E-AUTH-02S | STAFF | `GET /api/auth/me` | 200 | | | NOT RUN | |
| 29 | E2E-AUTH-02M | ADMIN | `GET /api/auth/me` | 200 | | | NOT RUN | |
| 30 | TC-SEC-016b | USER_C | `GET /api/auth/me` | 200 | | | NOT RUN | |
| 31 | TC-AUTH-004 | ANON | `POST /api/auth/login` | 401 | | | NOT RUN | |
| 32 | TC-AUTH-005 | ANON | `POST /api/auth/login` | 401 | | | NOT RUN | |
| 33 | TC-AUTH-007 | ANON | `GET /api/auth/me` | 401 | | | NOT RUN | |
| 34 | TC-AUTH-008a | ANON | `GET /api/auth/me` | 401 | | | NOT RUN | |
| 35 | TC-AUTH-008b | ANON | `GET /api/auth/me` | 401 | | | NOT RUN | |
| 36 | TC-AUTH-009 | ANON | `GET /api/auth/me` | 401 | | | NOT RUN | |
| 37 | TC-AUTH-011a | ANON | `GET /api/auth/me` | 401 | | | NOT RUN | |
| 38 | TC-AUTH-011b | ANON | `GET /api/auth/me` | 401 | | | NOT RUN | |
| 39 | TC-AUTH-012 | ANON | `GET /api/auth/me?access_token=…` | 401 | | | NOT RUN | |
| 40 | TC-AUTH-015 | ANON | `GET /api/events/published` | 401 | | | NOT RUN | |
| 41 | E2E-USR-02 | USER_A | `GET /api/users/by-email?email=…` | 200 | | | NOT RUN | |
| 42 | E2E-USR-02M | ADMIN | `GET /api/users/by-email?email=…` | 200 | | | NOT RUN | |
| 43 | E2E-USR-03 | USER_A | `GET /api/users/{…}` | 200 | | | NOT RUN | |
| 44 | E2E-USR-03M | ADMIN | `GET /api/users/{…}` | 200 | | | NOT RUN | |
| 45 | TC-SEC-006 | USER_B | `GET /api/users/by-email?email=…` | 403 | | | NOT RUN | |
| 46 | TC-SEC-007 | USER_B | `GET /api/users/{…}` | 403 | | | NOT RUN | |
| 47 | TC-SEC-007S | STAFF | `GET /api/users/by-email?email=…` | 403 | | | NOT RUN | |
| 48 | TC-SEC-007N | ANON | `GET /api/users/by-email?email=…` | 401 | | | NOT RUN | |
| 49 | TC-SEC-007U | ANON | `GET /api/users/{…}` | 401 | | | NOT RUN | |
| 50 | TC-SEC-007X | USER_A | `GET /api/users/no-existe-{…}` | 403 | | | NOT RUN | |
| 51 | E2E-USR-03N | ADMIN | `GET /api/users/no-existe-{…}` | 404 | | | NOT RUN | |
| 52 | TC-SEC-001a | ANON | `POST /api/events` | 401 | | | NOT RUN | |
| 53 | TC-SEC-001b | USER_A | `POST /api/events` | 403 | | | NOT RUN | |
| 54 | TC-SEC-001c | STAFF | `POST /api/events` | 403 | | | NOT RUN | |
| 55 | TC-SEC-001d | ADMIN | `GET /api/events/{…}-SEC` | 404 | | | NOT RUN | |
| 56 | TC-SEC-002a | ANON | `PATCH /api/events/{…}/publish` | 401 | | | NOT RUN | |
| 57 | TC-SEC-002b | USER_A | `PATCH /api/events/{…}/publish` | 403 | | | NOT RUN | |
| 58 | TC-SEC-002c | STAFF | `PATCH /api/events/{…}/publish` | 403 | | | NOT RUN | |
| 59 | TC-SEC-002d | ADMIN | `GET /api/events/{…}` | 200 | | | NOT RUN | |
| 60 | TC-SEC-003a | ANON | `POST /api/events/{…}/artists/{…}` | 401 | | | NOT RUN | |
| 61 | TC-SEC-003b | USER_A | `POST /api/events/{…}/artists/{…}` | 403 | | | NOT RUN | |
| 62 | TC-SEC-003c | STAFF | `POST /api/events/{…}/artists/{…}` | 403 | | | NOT RUN | |
| 63 | TC-SEC-003d | ADMIN | `GET /api/events/{…}` | 200 | | | NOT RUN | |
| 64 | E2E-EVT-01 | ADMIN | `POST /api/events` | 201 | | | NOT RUN | |
| 65 | E2E-EVT-02A | ADMIN | `GET /api/events/{…}` | 200 | | | NOT RUN | |
| 66 | TC-SEC-015a | ADMIN | `GET /api/events/{…}` | 200 | | | NOT RUN | |
| 67 | TC-SEC-015b | STAFF | `GET /api/events/{…}` | 200 | | | NOT RUN | |
| 68 | E2E-EVT-03b | ANON | `GET /api/events/published` | 200 | | | NOT RUN | |
| 69 | E2E-EVT-05 | ADMIN | `POST /api/events/{…}/artists/{…}` | 200 | | | NOT RUN | |
| 70 | E2E-EVT-05V | ADMIN | `GET /api/events/{…}` | 200 | | | NOT RUN | |
| 71 | E2E-EVT-05D | ADMIN | `POST /api/events/{…}/artists/{…}` | 409 | | | NOT RUN | |
| 72 | E2E-EVT-05N | ADMIN | `POST /api/events/{…}/artists/999999999` | 404 | | | NOT RUN | |
| 73 | E2E-EVT-05M | ADMIN | `POST /api/events/NO-EXISTE-{…}/artists/{…}` | 404 | | | NOT RUN | |
| 74 | E2E-EVT-04 | ADMIN | `PATCH /api/events/{…}/publish` | 200 | | | NOT RUN | |
| 75 | E2E-EVT-04V | ANON | `GET /api/events/{…}` | 200 | | | NOT RUN | |
| 76 | E2E-EVT-04D | ADMIN | `PATCH /api/events/{…}/publish` | 409 | | | NOT RUN | |
| 77 | E2E-EVT-04N | ADMIN | `PATCH /api/events/NO-EXISTE-{…}/publish` | 404 | | | NOT RUN | |
| 78 | E2E-EVT-03c | ANON | `GET /api/events/published` | 200 | | | NOT RUN | |
| 79 | E2E-EVT-06b | ANON | `GET /api/events/by-artist?stageName=…` | 200 | | | NOT RUN | |
| 80 | E2E-EVT-06c | ADMIN | `GET /api/events/by-artist?stageName=…` | 200 | | | NOT RUN | |
| 81 | E2E-EVT-01D | ADMIN | `POST /api/events` | 409 | | | NOT RUN | |
| 82 | E2E-EVT-01V | ADMIN | `POST /api/events` | 404 | | | NOT RUN | |
| 83 | E2E-EVT-01P | ADMIN | `POST /api/events` | 409 | | | NOT RUN | |
| 84 | E2E-EVT-01I | ADMIN | `POST /api/events` | 409 | | | NOT RUN | |
| 85 | TC-BIZ-007a | USER_A | `POST /api/tickets` | 201 | | | NOT RUN | |
| 86 | E2E-TKT-03a | USER_A | `GET /api/tickets/by-user?email=…` | 200 | | | NOT RUN | |
| 87 | TC-BIZ-007b | USER_A | `POST /api/tickets` | 201 | | | NOT RUN | |
| 88 | E2E-TKT-03b | USER_A | `GET /api/tickets/by-user?email=…` | 200 | | | NOT RUN | |
| 89 | TC-BIZ-007c | USER_A | `POST /api/tickets` | 201 | | | NOT RUN | |
| 90 | E2E-TKT-03c | USER_A | `GET /api/tickets/by-user?email=…` | 200 | | | NOT RUN | |
| 91 | E2E-TKT-02 | USER_A | `GET /api/tickets/{…}` | 200 | | | NOT RUN | |
| 92 | E2E-TKT-02S | STAFF | `GET /api/tickets/{…}` | 200 | | | NOT RUN | |
| 93 | E2E-TKT-02M | ADMIN | `GET /api/tickets/{…}` | 200 | | | NOT RUN | |
| 94 | E2E-TKT-03M | ADMIN | `GET /api/tickets/by-user?email=…` | 200 | | | NOT RUN | |
| 95 | E2E-TKT-04 | STAFF | `GET /api/events/{…}/tickets/paid` | 200 | | | NOT RUN | |
| 96 | E2E-TKT-04M | ADMIN | `GET /api/events/{…}/tickets/paid` | 200 | | | NOT RUN | |
| 97 | TC-SEC-008a | USER_A | `POST /api/tickets` | 403 | | | NOT RUN | |
| 98 | TC-SEC-008b | USER_B | `GET /api/tickets/by-user?email=…` | 200 | | | NOT RUN | |
| 99 | TC-SEC-009 | USER_B | `GET /api/tickets/{…}` | 403 | | | NOT RUN | |
| 100 | TC-SEC-010 | USER_B | `GET /api/tickets/by-user?email=…` | 403 | | | NOT RUN | |
| 101 | TC-SEC-011a | USER_B | `PATCH /api/tickets/{…}/cancel` | 403 | | | NOT RUN | |
| 102 | TC-SEC-012a | USER_B | `PATCH /api/tickets/{…}/use` | 403 | | | NOT RUN | |
| 103 | TC-SEC-011b | STAFF | `PATCH /api/tickets/{…}/cancel` | 403 | | | NOT RUN | |
| 104 | TC-SEC-012b | USER_A | `PATCH /api/tickets/{…}/use` | 403 | | | NOT RUN | |
| 105 | TC-SEC-011c | USER_A | `GET /api/tickets/{…}` | 200 | | | NOT RUN | |
| 106 | TC-SEC-013 | USER_A | `GET /api/events/{…}/tickets/paid` | 403 | | | NOT RUN | |
| 107 | TC-SEC-013N | ANON | `GET /api/events/{…}/tickets/paid` | 401 | | | NOT RUN | |
| 108 | TC-SEC-009N | ANON | `GET /api/tickets/{…}` | 401 | | | NOT RUN | |
| 109 | TC-SEC-008N | ANON | `POST /api/tickets` | 401 | | | NOT RUN | |
| 110 | TC-SEC-010N | ANON | `GET /api/tickets/by-user?email=…` | 401 | | | NOT RUN | |
| 111 | TC-SEC-011N | ANON | `PATCH /api/tickets/{…}/cancel` | 401 | | | NOT RUN | |
| 112 | TC-SEC-012N | ANON | `PATCH /api/tickets/{…}/use` | 401 | | | NOT RUN | |
| 113 | TC-SEC-008S | STAFF | `POST /api/tickets` | 403 | | | NOT RUN | |
| 114 | TC-SEC-008M | ADMIN | `POST /api/tickets` | 403 | | | NOT RUN | |
| 115 | E2E-TKT-01B | USER_B | `POST /api/tickets` | 201 | | | NOT RUN | |
| 116 | E2E-TKT-03d | USER_B | `GET /api/tickets/by-user?email=…` | 200 | | | NOT RUN | |
| 117 | TC-SEC-009B | USER_A | `GET /api/tickets/{…}` | 403 | | | NOT RUN | |
| 118 | E2E-TKT-05 | USER_A | `PATCH /api/tickets/{…}/cancel` | 200 | | | NOT RUN | |
| 119 | TC-BIZ-010V | USER_A | `GET /api/tickets/{…}` | 200 | | | NOT RUN | |
| 120 | TC-BIZ-011 ⚠ | USER_A | `PATCH /api/tickets/{…}/cancel` | 409 | | | NOT RUN | |
| 121 | TC-BIZ-012a | STAFF | `PATCH /api/tickets/{…}/use` | 409 | | | NOT RUN | |
| 122 | E2E-TKT-06 | STAFF | `PATCH /api/tickets/{…}/use` | 200 | | | NOT RUN | |
| 123 | TC-BIZ-012V | STAFF | `GET /api/tickets/{…}` | 200 | | | NOT RUN | |
| 124 | TC-BIZ-013 | STAFF | `PATCH /api/tickets/{…}/use` | 409 | | | NOT RUN | |
| 125 | E2E-TKT-05U | USER_A | `PATCH /api/tickets/{…}/cancel` | 409 | | | NOT RUN | |
| 126 | TC-BIZ-009b | STAFF | `GET /api/events/{…}/tickets/paid` | 200 | | | NOT RUN | |
| 127 | E2E-TKT-05M | ADMIN | `PATCH /api/tickets/{…}/cancel` | 200 | | | NOT RUN | |
| 128 | E2E-TKT-05V | USER_B | `GET /api/tickets/{…}` | 200 | | | NOT RUN | |
| 129 | E2E-TKT-02N | STAFF | `GET /api/tickets/NOEXISTE-{…}` | 404 | | | NOT RUN | |
| 130 | E2E-TKT-02X | USER_A | `GET /api/tickets/NOEXISTE-{…}` | 403 | | | NOT RUN | |
| 131 | E2E-TKT-06N | STAFF | `PATCH /api/tickets/NOEXISTE-{…}/use` | 404 | | | NOT RUN | |
| 132 | E2E-TKT-05N | ADMIN | `PATCH /api/tickets/NOEXISTE-{…}/cancel` | 404 | | | NOT RUN | |
| 133 | TC-HTTP-01 | ANON | `POST /api/users` | 400 | | | NOT RUN | |
| 134 | TC-HTTP-02 | ANON | `POST /api/users` | 400 | | | NOT RUN | |
| 135 | TC-HTTP-03 | ANON | `POST /api/users` | 400 | | | NOT RUN | |
| 136 | TC-HTTP-04 | ANON | `POST /api/users` | 400 | | | NOT RUN | |
| 137 | TC-HTTP-05 | ANON | `POST /api/auth/login` | 400 | | | NOT RUN | |
| 138 | TC-HTTP-06 | ADMIN | `POST /api/events` | 400 | | | NOT RUN | |
| 139 | TC-HTTP-07 | ADMIN | `POST /api/events` | 400 | | | NOT RUN | |
| 140 | TC-HTTP-08 | USER_A | `POST /api/tickets` | 400 | | | NOT RUN | |
| 141 | TC-HTTP-09 | USER_A | `POST /api/tickets` | 400 | | | NOT RUN | |
| 142 | TC-HTTP-10 | USER_A | `POST /api/tickets` | 404 | | | NOT RUN | |
| 143 | TC-HTTP-11 | USER_A | `POST /api/tickets` | 409 | | | NOT RUN | |
| 144 | TC-HTTP-12 ⚠ | USER_A | `POST /api/tickets` | 409 | | | NOT RUN | |
| 145 | TC-HTTP-13 ⚠ | ADMIN | `POST /api/events` | 400 | | | NOT RUN | |
| 146 | TC-HTTP-14 ⚠ | ADMIN | `POST /api/events` | 400 | | | NOT RUN | |
| 147 | TC-HTTP-15 ⚠ | ADMIN | `DELETE /api/tickets/{…}` | 405 | | | NOT RUN | |
| 148 | TC-AUTH-010 | ANON | `GET /api/auth/me` | 401 | | | NOT RUN | |
| 149 | TC-AUTH-013a | INACTIVE_USER | `GET /api/auth/me` | 401 | | | NOT RUN | |
| 150 | TC-AUTH-013b | ANON | `POST /api/auth/login` | 401 | | | NOT RUN | |
| 151 | TC-SEC-017 | STAFF | `GET /api/events/{…}/tickets/paid` | 403 | | | NOT RUN | |

⚠ = el catálogo anticipa un hallazgo por lectura del código (ver README §Hallazgos anticipados).

## Consolidación por módulo

| Módulo | PASS | FAIL | BLOCKED | NOT RUN |
|---|---|---|---|---|
| 00 Preparación / conectividad | | | | 1 |
| 01 Venues | | | | 3 |
| 02 Artists | | | | 5 |
| 03 Auth / usuarios | | | | 18 |
| 04 Usuarios / consulta y propiedad | | | | 11 |
| 05 Events / administración y visibilidad | | | | 23 |
| 06 Tickets / compra, consulta y ciclo de vida | | | | 29 |
| 07 Seguridad / escenarios negativos | | | | 46 |
| 08 Validaciones y errores HTTP | | | | 15 |

## Defectos y bloqueos encontrados

| ID | Caso | Precondiciones | Pasos de reproducción | HTTP esperado | HTTP observado | Severidad |
|---|---|---|---|---|---|---|
| | | | | | | |
