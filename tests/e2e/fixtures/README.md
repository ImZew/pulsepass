# Fixtures E2E

Datos de prueba para la **base dedicada `pulsepass_e2e`**. Nada de esto debe ejecutarse contra desarrollo, QA ni producción.

## 1. Qué contiene el seed (`seed-e2e.sql`)
| Fixture | Código / usuario | Notas |
|---|---|---|
| Venue activo | `E2E-VEN-01` | `venueActiveCode` |
| Venue inactivo | `E2E-VEN-INACTIVE` | Para crear un evento en venue inactivo (409) |
| Evento publicado | `E2E-EVT-PUBLISHED` | Fecha = hoy + 365 días; con el artista *Solar Beat* |
| Evento borrador | `E2E-EVT-DRAFT` | Con *Solar Beat*: sirve para probar que by-artist no lo expone |
| Evento por publicar | `E2E-EVT-TO-PUBLISH` | Solo para pruebas de publicación **denegada**; permanece en borrador |
| Evento pasado | `E2E-EVT-PAST` | Fecha = hoy − 30 días; la compra debe rechazarse |
| STAFF | `e2e_staff` (rol STAFF) | |
| ADMIN | `e2e_admin` (rol ADMIN) | |
| Usuario a desactivar | `e2e_inactive` (rol USER) | Se crea activo; se desactiva por SQL durante TC-AUTH-013 |

El artista *Solar Beat* viene de la migración V2 de Flyway. **Las contraseñas no están en el archivo**: el seed usa `crypt(:'staff_pw', gen_salt('bf', 10))` (extensión `pgcrypto`), que produce hashes `$2a$` compatibles con el BCrypt de Spring.

## 2. Cargar el seed
Primero la app debe haber arrancado al menos una vez contra `pulsepass_e2e` para que Flyway cree el esquema (V1–V4).

```powershell
# psql instalado en el equipo
psql -h localhost -U postgres -d pulsepass_e2e `
  -v staff_pw="<contraseña de 12+ caracteres>" -v admin_pw="<otra>" -v inactive_pw="<otra>" `
  -f tests/e2e/fixtures/seed-e2e.sql

# PostgreSQL en Docker (cambie <contenedor>)
Get-Content tests/e2e/fixtures/seed-e2e.sql | docker exec -i <contenedor> psql -U postgres -d pulsepass_e2e `
  -v staff_pw="<...>" -v admin_pw="<...>" -v inactive_pw="<...>"
```
Copie esas mismas contraseñas a las variables **secretas** `staffPassword`, `adminPassword` e `inactivePassword` de Postman (columna *Current value*; no se sincronizan ni se exportan). Al final el seed imprime tres consultas de verificación: deben mostrar 3 usuarios con credencial, 2 venues y 4 eventos.

## 3. Reiniciar a datos limpios (repetibilidad)
Opción A — base nueva (recomendada):
```sql
-- conectado a la base "postgres", NO a pulsepass_e2e; verifique el nombre antes de ejecutar
DROP DATABASE IF EXISTS pulsepass_e2e;
CREATE DATABASE pulsepass_e2e;
```
Luego reinicie la app (Flyway recrea el esquema), recargue el seed y cambie `runId` en Postman.
Opción B — sin borrar: cambie `runId` (todos los usuarios y códigos nuevos llevan ese sufijo). Los tickets T1/T2/T3 se vuelven a comprar, por lo que no hay colisión. Los fixtures `E2E-EVT-*` no se mutan, salvo `E2E-EVT-DRAFT` y `E2E-EVT-TO-PUBLISH` si alguna prueba los publica por error: en ese caso use la opción A.

## 4. Desactivar un usuario (TC-AUTH-013)
1. Login de `e2e_inactive` (cuerpo: identifier = `e2e_inactive`, password = `inactivePassword`) y copie el token a `inactiveToken`. Compruebe que `GET /api/auth/me` responde 200.
2. Desactive la cuenta:
```sql
UPDATE users SET active = false WHERE username = 'e2e_inactive';
```
3. Ejecute TC-AUTH-013a (/me con el token previo → **401**) y TC-AUTH-013b (login → **401**).
4. Para repetir: `UPDATE users SET active = true WHERE username = 'e2e_inactive';`

## 5. Revocar un rol (TC-SEC-017)
1. Con `staffToken` vigente, compruebe que `GET /api/events/{{publishedEventCode}}/tickets/paid` responde 200.
2. Revoque el rol (el token antiguo sigue firmado y vigente):
```sql
DELETE FROM user_roles WHERE role = 'STAFF' AND user_id = (SELECT id FROM users WHERE username = 'e2e_staff');
```
3. Ejecute TC-SEC-017 con el mismo token → **403**.
4. **Restaurar el rol** al terminar:
```sql
INSERT INTO user_roles (user_id, role) SELECT id, 'STAFF' FROM users WHERE username = 'e2e_staff' ON CONFLICT DO NOTHING;
```

## 6. Tokens inválidos por construcción
Estos dos valores **no son credenciales**: están firmados con una clave aleatoria que se descartó (o no están firmados), así que ningún servidor los acepta. Se dejan aquí, y no en el archivo de ambiente, para que el ambiente exportado no contenga ningún token.

- `foreignKeyToken` (TC-AUTH-011a, HS256 con otra clave):
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiaXNzIjoicHVsc2VwYXNzLWFwaSIsImlhdCI6MTc5MjI5NTg0NywiZXhwIjo0MTAyNDQ0ODAwLCJqdGkiOiI3Y2U1MjBmMi1kYmU2LTRmNGYtYWM0My0zYzg4ZGFiOGRhMDQifQ.qbyXYxoy1P3XSx9PsInruL4o7plm3IA6Vl8qfwm_7X8
```
- `unsignedToken` (TC-AUTH-011b, `alg=none`, sin firma):
```
eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiIxIiwiaXNzIjoicHVsc2VwYXNzLWFwaSIsImlhdCI6MTc5MjI5NTg0NywiZXhwIjo0MTAyNDQ0ODAwLCJqdGkiOiI3Y2U1MjBmMi1kYmU2LTRmNGYtYWM0My0zYzg4ZGFiOGRhMDQifQ.
```
Péguelos en las variables secretas homónimas de Postman. Para regenerarlos: construya un JWT con `alg=HS256` y claims `sub, iss=pulsepass-api, exp` firmado con **cualquier clave que no sea la de la aplicación**, o uno con `{"alg":"none"}` y la firma vacía (el token termina en un punto).
