# PulsePass — Pruebas E2E manuales con Postman (Fase 5)

Colección para recorrer a mano las **22 rutas** (20 de negocio + `login` + `me`) contra la API real y su PostgreSQL. No hay scripts de Postman, Runner ni Newman: cada petición se envía con **Send** y se inspecciona a ojo. Un `200` no basta: hay que revisar el JSON y el efecto en datos.

| Archivo | Contenido |
|---|---|
| `postman/PulsePass-Manual-E2E.postman_collection.json` | Colección v2.1: 151 casos (más 1 ancla de guía) en 10 carpetas, sin scripts |
| `postman/PulsePass-local.postman_environment.json` | Plantilla de variables (sin secretos) |
| `fixtures/seed-e2e.sql` · `fixtures/README.md` | Datos de prueba, reinicio, usuarios inactivos, rol revocado |
| `checklist-e2e-manual.md` | Orden exacto de ejecución, con qué copiar en cada paso |
| `registro-ejecucion-manual.md` | Bitácora a rellenar (PASS / FAIL / BLOCKED / NOT RUN) |
| `matriz-cobertura-22-rutas.md` | Ruta × casos × actores |

## 1. Preparar el ambiente (una sola vez por sesión)
**1.1 Base dedicada.** Nunca use la base de desarrollo.
```sql
CREATE DATABASE pulsepass_e2e;
```
**1.2 Arrancar la API apuntando a esa base** (PowerShell, desde la raíz del proyecto):
```powershell
$env:SPRING_DATASOURCE_URL      = "jdbc:postgresql://localhost:5432/pulsepass_e2e"
$env:SPRING_DATASOURCE_USERNAME = "<usuario de PostgreSQL>"
$env:SPRING_DATASOURCE_PASSWORD = "<contraseña de PostgreSQL>"
$env:PULSEPASS_JWT_SECRET_BASE64 = [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))   # clave exclusiva de E2E
.\mvnw spring-boot:run
```
Flyway aplica V1–V4 al arrancar. La clave JWT es aleatoria y solo vive en esa terminal.

**1.3 Cargar el seed** (con la app ya arrancada una vez): ver `fixtures/README.md` §2. Crea venues, eventos y las cuentas `e2e_staff`, `e2e_admin` y `e2e_inactive` con BCrypt. Las contraseñas se pasan por línea de comandos, no están en el repositorio.

**1.4 Importar en Postman:** *Import* → la colección y el ambiente. Seleccione el ambiente **PulsePass-local** (arriba a la derecha).

## 2. Variables
Edite el ambiente **duplicado en su Postman**, no los archivos del repositorio.

- **Cambie primero `runId`** (por ejemplo `r2`) cuando repita una sesión: usuarios y códigos nuevos se derivan de él.
- Las variables de tipo *secret* (`*Password`, `*Token`) se escriben en la columna **Current value**: son locales, no se sincronizan ni se exportan. No las pegue en el *Initial value*.
- `staffPassword`, `adminPassword` e `inactivePassword` son las que usó en el seed. `userAPassword`, `userBPassword` y `userCPassword` las elige usted (12 a 72 caracteres).
- `artistId` y los cuatro `ticket*Code` se rellenan durante la ejecución, copiándolos de las respuestas (el checklist indica cuándo).
- `foreignKeyToken` y `unsignedToken` salen de `fixtures/README.md` §6; `expiredToken` se obtiene como se explica en §5.
- `eventFutureDate` debe ser **futura** (por defecto `2030-12-31T20:00:00`). Cámbiela si ese año ya pasó.

## 3. Cómo se ejecuta
1. Abra una petición, compruebe en *Authorization* qué token usa y pulse **Send**.
2. Compare con lo esperado de la descripción: HTTP **exacto**, JSON, y el estado con un GET posterior cuando muta datos.
3. En los casos con 📋 *Copiar* del checklist, copie el valor indicado a la variable.
4. Anote el resultado en `registro-ejecucion-manual.md`. Si falla un prerrequisito, marque los dependientes **BLOCKED**, nunca PASS.
5. Un token dura 15 minutos: si una petición protegida da 401 inesperado, repita el login de ese actor.

**Capturar tokens.** Después de cada login copie solo el valor de `accessToken` a la variable del actor: `userAToken`, `userBToken`, `userCToken`, `staffToken`, `adminToken`. Compruebe con `GET /api/auth/me` que la identidad es la correcta.

**Códigos de tickets.** Comprar, cancelar, usar, crear y publicar responden con **cuerpo vacío** (contrato de la Fase 3). El `ticketCode` se obtiene con `GET /api/tickets/by-user` justo después de comprar: copie el del ticket **más nuevo** (mayor `id`). Hay cuatro tickets: T1 `ticketCancelableCode`, T2 `ticketUsableCode`, T3 `ticketIdorCode` (solo para pruebas IDOR, no se muta) y `ticketBCode`.

## 4. Orden
Siga `checklist-e2e-manual.md`. Resumen: preparación → **A** público → **B** registro/JWT → JWT inválidos → usuarios → **C** catálogo ADMIN → **D** tickets → **E** errores → casos con preparación manual. Las pruebas IDOR se ejecutan **antes** de mutar los tickets y antes de que USER_B compre.

## 5. Token expirado (TC-AUTH-010)
Sin cambiar código: reinicie la API con un TTL corto, haga login, espere y úselo.
```powershell
$env:PULSEPASS_SECURITY_JWT_ACCESSTOKENTTL = "PT5S"     # misma clave JWT y misma base que antes
.\mvnw spring-boot:run
```
1. Login de USER_A: el JSON debe mostrar `"expiresIn": 5`. Copie el token a **`expiredToken`** (no a `userAToken`).
2. Espere 10 segundos y envíe TC-AUTH-010 → **401**.
3. Detenga la API, elimine la variable (`Remove-Item Env:PULSEPASS_SECURITY_JWT_ACCESSTOKENTTL`) y arránquela otra vez con el TTL normal.

## 6. Adaptaciones al código real
El PRD manda ajustar la colección al código, no al revés. Diferencias con el texto del PRD:
- `GET /api/users/{username}` es la ruta real (el PRD la llama *by-username?username=*).
- Crear evento, publicar, asociar artista, comprar, cancelar y usar responden con cuerpo vacío.
- Las categorías son `MUSIC, SPORTS, TECHNOLOGY, EDUCATION, CULTURE, ENTERTAINMENT`; los tipos de ticket `GENERAL, VIP, BACKSTAGE, STUDENT`; los estados de ticket `RESERVED, PAID, CANCELLED, USED`.
- La compra deja el ticket en `PAID` con precio fijo `100.00`.
- Política para recursos ajenos: **403**. Un USER recibe 403 tanto para un ticket/usuario ajeno como para uno inexistente (anti-enumeración); STAFF/ADMIN reciben el 404 normal. Los borradores se ocultan con **404**.
- `STAFF` es global sobre tickets (limitación documentada del MVP, no un diseño para producción).

## 7. Hallazgos anticipados (por lectura del código)
Estos casos probablemente den **FAIL**. Es el resultado correcto de la prueba: se registran como defectos (FR-E2E-014), no se "arreglan" ajustando la colección.

| Caso | Esperado (PRD) | Probable comportamiento actual | Causa |
|---|---|---|---|
| TC-BIZ-011 — cancelar dos veces | 409 | 200 | `TicketServiceImpl.cancel` solo rechaza tickets `USED` |
| TC-HTTP-12 — comprar un evento en borrador | 409 | 201 | `purchase` solo valida que la fecha no sea pasada |
| TC-HTTP-13 / 14 — JSON inválido, enum inválido | 400 | 500 | `GlobalExceptionHandler` no maneja `HttpMessageNotReadableException`; lo atrapa el `catch (Exception)` |
| TC-HTTP-15 — método no soportado | 405 | 500 | Mismo `catch (Exception)` |
| Aforo agotado, edad mínima (TC-BIZ-014) | 409 | no verificable | Esas reglas no existen en el código |

Cualquier **500** en un escenario nominal hace fallar todo el recorrido.

## 8. Confidencialidad
No suba tokens, contraseñas ni capturas con ellos. El `.gitignore` de esta carpeta excluye `*.local.json`, `*.secrets.json` y `evidencia/`. No exporte el ambiente con sus valores rellenos.
