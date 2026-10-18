-- V4__security_credentials_roles.sql
-- Fase 4: credenciales y roles. No modifica V1-V3.

CREATE TABLE user_credentials (
    user_id             BIGINT       PRIMARY KEY,
    password_hash       VARCHAR(100) NOT NULL,
    password_changed_at TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CONSTRAINT fk_credentials_user FOREIGN KEY (user_id)
        REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE user_roles (
    user_id BIGINT      NOT NULL,
    role    VARCHAR(20) NOT NULL,
    CONSTRAINT pk_user_roles PRIMARY KEY (user_id, role),
    CONSTRAINT fk_roles_user FOREIGN KEY (user_id)
        REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT ck_roles_valid CHECK (role IN ('USER', 'STAFF', 'ADMIN'))
);

-- Usuarios preexistentes: reciben ROLE_USER pero NO credenciales.
-- No pueden iniciar sesion hasta una activacion segura (sin contrasenas por defecto).
INSERT INTO user_roles (user_id, role)
SELECT id, 'USER' FROM users
ON CONFLICT DO NOTHING;
