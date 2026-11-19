# PulsePass Web — Frontend (React + TypeScript + Tailwind v4)

Aplicación web SPA para la plataforma de gestión y boletería de eventos **PulsePass**, construida con estética **Neo-Brutalista Editorial** y componentes 3D interactivos.

## Stack Tecnológico

* **Core:** React 19, TypeScript (modo estricto), Vite
* **Estilos:** Tailwind CSS v4 (`clsx` para composición tipada)
* **Enrutamiento:** React Router v8 (carga perezosa `lazy` en rutas secundarias y protección por rol)
* **Estado y Datos:** TanStack Query v5, React Hook Form + Zod (validación de formularios y contratos HTTP)
* **Calidad y Pruebas:** `oxlint`, Vitest, Testing Library, MSW (Mock Service Worker)

## Requisitos Previos

* **Node.js** 20+ y **npm**
* **Backend Spring Boot** ejecutándose en `http://localhost:8080` (PostgreSQL + Flyway activos y variable `PULSEPASS_JWT_SECRET_BASE64` configurada)

## Instalación y Ejecución Local

```bash
cd pulsepass-web
npm install
npm run dev