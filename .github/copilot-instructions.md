# Project Guidelines

## Code Style

- Use TypeScript with React function components and hooks; follow patterns in [src/components](src/components) and [src/pages](src/pages).
- Prefer SCSS modules for component-local styles (e.g. [src/components/layout/DashboardLayout.module.scss](src/components/layout/DashboardLayout.module.scss)) and keep global styles in [src/styles/global.scss](src/styles/global.scss).
- Keep props and domain models strongly typed via the types in [src/types](src/types) (for example [src/types/customer.ts](src/types/customer.ts)).

## Architecture

- Entry point is [src/main.tsx](src/main.tsx), which mounts [src/App.tsx](src/App.tsx) wrapped in a `BrowserRouter`.
- Routing and auth guards live in [src/app/router.tsx](src/app/router.tsx) using `ProtectedRoute` / `PublicRoute` and the Zustand auth store from [src/store/auth.store.ts](src/store/auth.store.ts).
- HTTP requests must go through the shared Axios instance in [src/lib/axios.ts](src/lib/axios.ts), with domain-specific services in [src/services](src/services) and state in Zustand stores in [src/store](src/store).
- Presentational components are under [src/components](src/components); high-level screens live in [src/pages/dashboard](src/pages/dashboard) and compose components, services, and stores.
- See [README.md](README.md) for the underlying Vite/React template details.

## Build and Test

- Install dependencies: `npm install`.
- Start development server: `npm run dev`.
- Type-check and build for production: `npm run build`.
- Run linting: `npm run lint`.
- Preview production build locally: `npm run preview`.

## Conventions

- API base URL comes from `VITE_API_URL`; ensure this env var is set when running or building.
- Always use the `api` instance from [src/lib/axios.ts](src/lib/axios.ts) via thin service wrappers in [src/services](src/services) (for example [src/services/customers.service.ts](src/services/customers.service.ts)) instead of calling Axios directly.
- The Axios response interceptor normalizes MongoDB `_id` fields to `id`; front-end code should rely on `id` where possible.
- Authentication tokens are stored under the `notiflow_token` key, read by the Axios request interceptor, and cleared on `401` responses for non-auth endpoints, which then redirect to `/login`.
- Use Zustand stores (see [src/store/customers.store.ts](src/store/customers.store.ts) as a reference) for shared state instead of prop-drilling; keep side effects (API calls) inside stores or services.
- Reuse existing UI primitives (buttons, inputs, loaders) under [src/components/ui](src/components/ui) before introducing new ones, keeping styling consistent with the dashboard layout.
