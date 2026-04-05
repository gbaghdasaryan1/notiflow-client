# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # start Vite dev server
npm run build      # tsc -b && vite build
npm run lint       # eslint .
npm run preview    # preview production build
```

There are no tests configured in this project.

## Environment

A `VITE_API_URL` environment variable must be set (e.g. in `.env.local`) for the Axios client to reach the backend.

## Architecture

This is a React 19 + TypeScript SPA built with Vite, using Zustand for state, Axios for API calls, React Router v7 for routing, and SCSS Modules for styling.

### Auth flow

JWT tokens are stored in `localStorage` under the key `notiflow_token`. `src/lib/axios.ts` attaches the token to every request via an interceptor and redirects to `/login` on 401 (except for auth endpoints). `src/store/auth.store.ts` is the single source of truth for auth state; it initialises from `localStorage` on load.

### Routing

`src/app/router.tsx` defines all routes. Routes are either wrapped in `ProtectedRoute` (requires auth) or `PublicRoute` (redirects to `/` when already authenticated). All authenticated pages are rendered inside `DashboardLayout` (`src/components/layout/dashboard/DashboardLayout.tsx`), which provides the top nav bar.

### State management

Each domain has a Zustand store in `src/store/` (`auth`, `customers`, `templates`, `scheduler`). Stores own async operations and call the matching service in `src/services/`. The `features/customers/` directory has its own `store.ts` — this is a parallel store for the customers feature slice (co-located with the feature page rather than in `src/store/`).

### Data normalisation

The Axios response interceptor in `src/lib/axios.ts` recursively maps MongoDB `_id` fields to `id` on every response, so the rest of the app always works with `id`.

### SCSS conventions

All SCSS modules start with `@use '../../../styles/variables' as *;` (adjust the relative depth to match the file's location relative to `src/`). The correct number of `../` levels is exactly the number of directories between the file and `src/`. All design tokens (colors, spacing, typography, shadows, transitions, z-indices) live in `src/styles/variables.scss`. Global resets and base styles are in `src/styles/global.scss`.

### Template variables

Templates support `{{variableName}}` interpolation. `src/lib/template-variables.ts` provides utilities for extracting variable names, rendering previews with sample data, rendering with real values, and splitting content into typed segments for rich preview UI.

### Vite path aliases

`@` → `src/`, `@components` → `src/components/`, `@pages` → `src/pages/`, `@store` → `src/store/`, `@services` → `src/services/`, `@lib` → `src/lib/`. SCSS files cannot use these aliases — they must use relative paths.

`@types` is **not** a custom alias — it is TypeScript's reserved namespace for DefinitelyTyped. Use `@/types/template`, `@/types/scheduler`, etc. (via the `@` alias) for local type imports. Customer types live in `src/features/customers/types.ts` (there is no `src/types/customer.ts`), so import them as `@/features/customers/types`.
