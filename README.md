# PulsePass

API REST (Java 21, Spring Boot 4, PostgreSQL, Flyway) para descubrir eventos y gestionar entradas.
Fases: 1 Persistencia → 2 Servicios → 3 Controladores REST → **4 Seguridad (Spring Security + JJWT)**.

## Requisitos
Java 21, Docker (para los tests con Testcontainers) y PostgreSQL local con la base `pulsepass_db` (ver `application.yaml`).

## Variables de entorno (Fase 4)
| Variable | Obligatoria | Descripción |
|---|---|---|
| `PULSEPASS_JWT_SECRET_BASE64` | **Sí** | Clave HS256: mínimo 32 bytes aleatorios en Base64. La app **no arranca** si falta o es débil. |
| `PULSEPASS_JWT_ISSUER` | No | Emisor del JWT. Por defecto `pulsepass-api`. |
| `PULSEPASS_CORS_ORIGINS` | No | Orígenes permitidos para CORS, separados por coma. Vacío = ninguno. |

La duración del token es `pulsepass.security.jwt.access-token-ttl` (`PT15M` por defecto).

```bash
# Generar la clave
openssl rand -base64 32

# Linux / macOS
export PULSEPASS_JWT_SECRET_BASE64="<valor generado>"
# Windows PowerShell
$env:PULSEPASS_JWT_SECRET_BASE64="<valor generado>"
```
No subas la clave al repositorio: `.env` está en `.gitignore` y `.env.example` es solo una plantilla.
Los tests usan una clave ficticia en `src/test/resources/application.properties`.

## Ejecutar
```bash
./mvnw spring-boot:run
```

## Autenticación
`POST /api/users` crea la cuenta (siempre con rol `USER`) y `POST /api/auth/login` devuelve el token:
```http
POST /api/auth/login
{"identifier":"andrea","password":"UnaFraseSegura2026!"}

→ 200 {"accessToken":"<JWT>","tokenType":"Bearer","expiresIn":900}

GET /api/auth/me
Authorization: Bearer <JWT>
```
La contraseña debe tener entre 12 y 72 caracteres. El registro no devuelve token: el flujo es registro → login.

## Roles de prueba (STAFF / ADMIN)
No hay forma de obtenerlos por HTTP. Registra la cuenta con `POST /api/users` y promuévela en la base (solo desarrollo):
```sql
INSERT INTO user_roles (user_id, role) SELECT id, 'ADMIN' FROM users WHERE username = 'admin' ON CONFLICT DO NOTHING;
INSERT INTO user_roles (user_id, role) SELECT id, 'STAFF' FROM users WHERE username IN ('laura','miguel') ON CONFLICT DO NOTHING;
```
Los usuarios anteriores a la Fase 4 reciben `ROLE_USER` pero **no tienen contraseña**: no pueden iniciar sesión hasta una activación segura.

## Endpoints y permisos
| Verbo | Ruta | Acceso |
|---|---|---|
| POST | `/api/auth/login` | Público |
| GET | `/api/auth/me` | Autenticado |
| POST | `/api/users` | Público |
| GET | `/api/users/{username}` · `/api/users/by-email?email=` | Propio usuario o ADMIN |
| GET | `/api/venues/{code}` · `/api/venues/active` | Público |
| GET | `/api/artists/{id}` · `/by-stage-name?stageName=` · `/active` | Público |
| GET | `/api/events/published` | Público |
| GET | `/api/events/{eventCode}` | Público si está publicado; otro estado → 404 salvo STAFF/ADMIN |
| GET | `/api/events/by-artist?stageName=` | Público (solo publicados); STAFF/ADMIN ven todos |
| POST | `/api/events` · PATCH `/{eventCode}/publish` · POST `/{eventCode}/artists/{artistId}` | ADMIN |
| POST | `/api/tickets` | USER, y `userEmail` debe ser el suyo |
| GET | `/api/tickets/{ticketCode}` | Propietario, STAFF o ADMIN |
| GET | `/api/tickets/by-user?email=` | Propio usuario o ADMIN |
| GET | `/api/events/{eventCode}/tickets/paid` | STAFF o ADMIN |
| PATCH | `/api/tickets/{ticketCode}/cancel` | Propietario o ADMIN |
| PATCH | `/api/tickets/{ticketCode}/use` | STAFF o ADMIN |

Todo lo demás exige autenticación. Un USER recibe **403** ante un ticket ajeno o inexistente (no se pueden enumerar códigos). Los errores 401/403 usan el mismo `ErrorResponse` que el resto de la API.

## Pruebas
```bash
./mvnw test                                   # todo (los *IT necesitan Docker)
./mvnw test -Dtest='Jwt*Test,*ServiceTest,SecurityMatrixTest,RouteSecurityMatrixTest'   # sin Docker
./mvnw test -Dtest='SecurityIT,DemoScenarioIT,MigrationUpgradeIT'                       # integración
```

## Limitaciones conocidas del MVP
STAFF tiene acceso global (no está ligado a un evento); no hay límite de intentos de login; no hay rotación de claves ni revocación de tokens (el logout del cliente no invalida el token hasta que vence); HTTPS depende del despliegue.
