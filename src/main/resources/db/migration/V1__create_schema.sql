-- V1__create_schema.sql

CREATE TABLE venues (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    address VARCHAR(255) NOT NULL,
    capacity INT NOT NULL CHECK (capacity > 0),
    active BOOLEAN DEFAULT TRUE
);

CREATE TABLE events (
    id BIGSERIAL PRIMARY KEY,
    event_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL, -- Enum guardado como String
    status VARCHAR(50) NOT NULL,   -- Enum guardado como String
    event_date TIMESTAMP NOT NULL,
    minimum_age INT,
    venue_id BIGINT NOT NULL REFERENCES venues(id)
);

CREATE TABLE artists (
    id BIGSERIAL PRIMARY KEY,
    stage_name VARCHAR(100) UNIQUE NOT NULL,
    country VARCHAR(100),
    genre VARCHAR(100),
    active BOOLEAN DEFAULT TRUE
);

-- Tabla intermedia N:M con PK compuesta para evitar duplicados del mismo par
CREATE TABLE event_artists (
    event_id BIGINT NOT NULL REFERENCES events(id),
    artist_id BIGINT NOT NULL REFERENCES artists(id),
    PRIMARY KEY (event_id, artist_id)
);

CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    active BOOLEAN DEFAULT TRUE
);

-- Perfil 1:1 con restricción UNIQUE en la Foreign Key
CREATE TABLE user_profiles (
    id BIGSERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(50),
    city VARCHAR(100),
    birth_date DATE,
    user_id BIGINT NOT NULL UNIQUE REFERENCES users(id)
);

-- Entidad fuerte para los tickets
CREATE TABLE tickets (
    id BIGSERIAL PRIMARY KEY,
    ticket_code VARCHAR(50) UNIQUE NOT NULL,
    type VARCHAR(50) NOT NULL,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    status VARCHAR(50) NOT NULL,
    purchase_date TIMESTAMP NOT NULL,
    user_id BIGINT NOT NULL REFERENCES users(id),
    event_id BIGINT NOT NULL REFERENCES events(id)
);