# SickAgent Frontend

Production site: `https://sickagent.net`

## Overview

SickAgent frontend is a single-page application built with React and Vite.
It provides:

- public marketing/docs pages
- authentication pages
- protected application area (`/app/*`) for platform operations

## Tech Stack

- `React 18`
- `TypeScript`
- `Vite`
- `React Router`
- `Tailwind CSS`
- `@tanstack/react-query` for server-state management
- `react-helmet-async` for SEO metadata per route

## How It Works

- **Routing**: client-side routing via `BrowserRouter`, including public and protected routes.
- **Auth gating**: protected pages under `/app/*` are wrapped with route guards and token checks.
- **Data flow**: API requests are handled through typed API modules in `src/api/`, with caching/re-fetch logic managed by React Query.
- **UI composition**: pages are split into reusable UI/layout components and lazy-loaded for faster initial load.
- **SEO/static layer**: build output is post-processed to generate static SEO-friendly HTML pages and route fallbacks.

## Frontend Project Structure

- `src/main.tsx` - application entry point
- `src/App.tsx` - router tree, providers, route guards
- `src/pages/` - route-level screens (landing, docs, auth, app pages)
- `src/components/` - reusable UI and layout components
- `src/api/` - HTTP client and endpoint modules
- `src/hooks/` - shared hooks (auth, theme, etc.)
- `src/seo/` - route SEO configuration and metadata helpers
- `scripts/generate-static-seo.mjs` - post-build HTML generation
- `web/` - generated production artifacts

## Build Pipeline (Concept)

1. TypeScript checks and compilation validation
2. Vite bundles the SPA and assets into `web/`
3. SEO/static generation script augments output with metadata-rich HTML pages and SPA fallback files