-- seed-e2e.sql — SOLO para la base dedicada pulsepass_e2e.
-- Ejecutar DESPUÉS de arrancar la app una vez (Flyway crea el esquema V1-V4) y ANTES de las pruebas.
-- Las contraseñas NO están en este archivo: se pasan en tiempo de ejecución con -v (ver fixtures/README.md).
--   psql -U postgres -d pulsepass_e2e -v staff_pw="..." -v admin_pw="..." -v inactive_pw="..." -f seed-e2e.sql
\set ON_ERROR_STOP on

-- Guardia: aborta si no es la base E2E.
DO $$
BEGIN
  IF current_database() <> 'pulsepass_e2e' THEN
    RAISE EXCEPTION 'Este seed solo se ejecuta en pulsepass_e2e (base actual: %)', current_database();
  END IF;
END $$;

CREATE EXTENSION IF NOT EXISTS pgcrypto;   -- crypt()/gen_salt('bf') generan hashes $2a$ compatibles con BCrypt de Spring

-- ---------------------------------------------------------------- venues
INSERT INTO venues (code, name, city, address, capacity, active) VALUES
 ('E2E-VEN-01',       'E2E Arena',            'Santa Marta', 'Calle 1 # 1-1', 500, true),
 ('E2E-VEN-INACTIVE', 'E2E Venue Inactiva',   'Santa Marta', 'Calle 2 # 2-2', 100, false)
ON CONFLICT (code) DO NOTHING;

-- ---------------------------------------------------------------- eventos
INSERT INTO events (event_code, name, description, category, status, event_date, minimum_age, venue_id)
SELECT e.code, e.name, e.descr, e.cat, e.st, e.dt, 0, (SELECT id FROM venues WHERE code = 'E2E-VEN-01')
FROM (VALUES
 ('E2E-EVT-PUBLISHED',  'E2E Evento Publicado',  'Fixture publicado (fecha futura)',  'MUSIC', 'PUBLISHED', now() + interval '365 days'),
 ('E2E-EVT-DRAFT',      'E2E Evento Borrador',   'Fixture borrador (invisible al público)', 'MUSIC', 'DRAFT', now() + interval '365 days'),
 ('E2E-EVT-TO-PUBLISH', 'E2E Evento Por Publicar','Fixture para pruebas de publicación denegada', 'MUSIC', 'DRAFT', now() + interval '365 days'),
 ('E2E-EVT-PAST',       'E2E Evento Pasado',     'Fixture con fecha pasada (compra rechazada)', 'MUSIC', 'PUBLISHED', now() - interval '30 days')
) AS e(code, name, descr, cat, st, dt)
ON CONFLICT (event_code) DO NOTHING;

-- 'Solar Beat' (artista de la migración V2) en el evento publicado y en el borrador
INSERT INTO event_artists (event_id, artist_id)
SELECT ev.id, a.id FROM events ev, artists a
WHERE ev.event_code IN ('E2E-EVT-PUBLISHED', 'E2E-EVT-DRAFT') AND a.stage_name = 'Solar Beat'
ON CONFLICT DO NOTHING;

-- ---------------------------------------------------------------- usuarios privilegiados e inactivo
INSERT INTO users (username, email, active) VALUES
 ('e2e_staff',    'e2e.staff@example.test',    true),
 ('e2e_admin',    'e2e.admin@example.test',    true),
 ('e2e_inactive', 'e2e.inactive@example.test', true)   -- se desactiva manualmente durante TC-AUTH-013
ON CONFLICT (username) DO NOTHING;

INSERT INTO user_profiles (first_name, last_name, city, birth_date, user_id)
SELECT 'E2E', u.username, 'Santa Marta', DATE '1990-01-01', u.id
FROM users u WHERE u.username IN ('e2e_staff', 'e2e_admin', 'e2e_inactive')
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO user_credentials (user_id, password_hash)
SELECT id, crypt(:'staff_pw', gen_salt('bf', 10)) FROM users WHERE username = 'e2e_staff'
ON CONFLICT (user_id) DO NOTHING;
INSERT INTO user_credentials (user_id, password_hash)
SELECT id, crypt(:'admin_pw', gen_salt('bf', 10)) FROM users WHERE username = 'e2e_admin'
ON CONFLICT (user_id) DO NOTHING;
INSERT INTO user_credentials (user_id, password_hash)
SELECT id, crypt(:'inactive_pw', gen_salt('bf', 10)) FROM users WHERE username = 'e2e_inactive'
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO user_roles (user_id, role) SELECT id, 'STAFF' FROM users WHERE username = 'e2e_staff'    ON CONFLICT DO NOTHING;
INSERT INTO user_roles (user_id, role) SELECT id, 'ADMIN' FROM users WHERE username = 'e2e_admin'    ON CONFLICT DO NOTHING;
INSERT INTO user_roles (user_id, role) SELECT id, 'USER'  FROM users WHERE username = 'e2e_inactive' ON CONFLICT DO NOTHING;

-- Verificación rápida
SELECT u.username, r.role, (c.user_id IS NOT NULL) AS tiene_credencial, u.active
FROM users u JOIN user_roles r ON r.user_id = u.id LEFT JOIN user_credentials c ON c.user_id = u.id
WHERE u.username LIKE 'e2e\_%' ORDER BY u.username;
SELECT code, active FROM venues WHERE code LIKE 'E2E-%' ORDER BY code;
SELECT event_code, status, event_date::date FROM events WHERE event_code LIKE 'E2E-EVT-%' ORDER BY event_code;
