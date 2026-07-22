# Single SSR Template

A [Vite+](https://voidzero.dev) template for a single full-stack React app: [TanStack
Start](https://tanstack.com/start) with server-rendered file-based routing, better-auth (email/OTP +
link-based password reset), and a Feature-Sliced Design source layout. To scaffold a new project
from it, keep the tooling, conventions, and auth flow, and build your app on top.

## Stack

- **[better-auth](https://better-auth.com)** — email/password, OTP email verification, link-based
  password reset, with anti-enumeration invariants baked in. Runs in-process (no separate API
  server) against a local SQLite db; the server-only pieces live in `src/server/`. See "Auth flow"
  in [AGENTS.md](./AGENTS.md).
- **[shadcn/ui](https://ui.shadcn.com)** — components live in `src/shared/ui`; add more with
  `vp run ui:add <component>`.
- **[Vite+](https://voidzero.dev)** (`vp`) — single CLI wrapping Vite, Rolldown, Vitest, tsdown,
  Oxlint, Oxfmt, and Vite Task. All dev/build/lint/test/package-manager commands go through it, with
  `pnpm` as the underlying package manager; see [AGENTS.md](./AGENTS.md) for the full command
  reference.
- **[TanStack](https://tanstack.com)** Start/Router/Query/Form — file-based routing with route
  guards, a shared query client (`@/shared/query`), form hooks built on `useAppForm` + zod.
- **React 19**, Tailwind CSS 4, i18next, **Feature-Sliced Design** (held by review discipline — no
  lint plugin enforces it yet; see [AGENTS.md](./AGENTS.md)).
- **Playwright** for e2e, **Vitest** (via `vp test`) for unit tests.

## Structure

Single app, no monorepo. FSD layers live inside `src/`, top imports bottom only:

```
src/
  pages/      file-based routes (TanStack Start); __root.tsx carries the provider tree
  features/   auth flows — sign-in, sign-in-otp, sign-up, verify-email, forgot/reset-password, sign-out
  entities/   auth domain vocabulary — field schemas, shared form schemas, OTP UI
  shared/     framework-agnostic infra — ui, app-form, query, i18n, router, auth-client
  server/     backend-only modules (better-auth instance, SQLite db, session, dev mailbox)
```

Each slice on `features/`/`entities/` exposes a public API (`index.ts`) that other slices import
through; reaching into a foreign slice's segments is forbidden. `shared/` and `server/` have no
barrel requirement. `server/` sits outside the FSD stack — only route handlers and the root
session load may import from it. Read [AGENTS.md](./AGENTS.md) for the full import rules.

## Getting started

Requires the [`vp`](https://voidzero.dev) CLI. Common commands are wrapped as `package.json`
scripts, run with `vp run <script>` (e.g. `vp run dev`, `vp run e2e`).

```bash
vp install                # 1. install dependencies
vp exec auth secret       # 2. generate a BETTER_AUTH_SECRET (copy the printed value)
cp .env.example .env.local  # 3. create your local env, then paste the secret into BETTER_AUTH_SECRET
vp run auth:migrate       # 4. apply better-auth's SQLite migrations (creates ./dev-auth.db)
vp run dev                # 5. dev server on http://localhost:3000
```

`.env`/`*.local` are gitignored, so `.env.local` must be created (step 3) before running. The SQLite
db defaults to `./dev-auth.db` (`AUTH_DB_PATH`); use `:memory:` for an ephemeral db (e2e runs use
this). Re-run `vp run auth:migrate` whenever the auth schema changes.

Useful scripts (see root `package.json`):

```bash
vp check                  # format, lint, and type-check (the one validation gate)
vp test                   # unit tests (watch); `vp test run` for once
vp run e2e                # build + run Playwright e2e (vp build && vp exec playwright test)
vp build                  # production build to dist/
vp preview                # serve the built app
vp run auth:migrate       # apply better-auth SQLite migrations
vp run ui:add <component> # add a shadcn/ui component to src/shared/ui
```

## Testing

- **Unit tests** (`*.test.ts`, colocated with source) run via `vp test`, importing helpers from
  `vite-plus/test` rather than `vitest` directly. Run one file with `vp test run <path>`, or one
  test by name with `vp test run -t "<pattern>"`.
- **E2e tests** live under the root `e2e/` directory and run via `vp run e2e` (one Playwright project,
  `playwright.config.ts`). Its `webServer` runs a production preview against an in-memory db
  (`AUTH_DB_PATH=:memory: vp preview`) on the `E2E_BASE_URL` port. Since every spec shares that one
  server, non-journey specs must stay state-free; full sign-up → verify → sign-in and password-reset
  journeys live in `e2e/journeys/` and generate a unique email per test.
- A dev-only endpoint (`GET /api/dev/mailbox/:email`) lets e2e tests read OTP codes and reset links
  without a real mailbox. It's gated to `DEV` or `:memory:` runs only.

## Using this as a template

Click "Use this template" on GitHub to create a new repo with fresh git history, then:

1. Build your app's routes under `src/pages/` and their logic as new `features/`/`entities/` slices;
   keep `shared/`, `server/`, and the auth features as the foundation.
2. Set `BETTER_AUTH_URL` and `BETTER_AUTH_SECRET` in `.env.local`, and swap the dev SQLite db /
   console-log mailer in `src/server/` for real infrastructure before production.
3. Read [AGENTS.md](./AGENTS.md) before making structural changes — it documents FSD import rules,
   form/schema conventions, TanStack Query conventions, and the auth-flow invariants (anti-
   enumeration, OTP-only verification) that the e2e tests depend on.
4. Run `vp check` and `vp run e2e` after scaffolding changes to confirm checks, tests, and the build
   still pass.
