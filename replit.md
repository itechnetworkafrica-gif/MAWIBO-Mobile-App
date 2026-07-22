# MAWIBO — Mental Health Companion App

A full-stack mental health app for Liberia. Users track mood, find doctors by county, chat with an AI companion, join a community, and access wellness tools (journaling, breathing, CBT, sleep coach, etc.).

## Run & Operate

- `pnpm --filter @workspace/ehealthmate run dev` — run the Expo mobile/web app
- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string
- Required env: `SESSION_SECRET` — JWT signing secret
- Required env: `OPENAI_API_KEY` — for AI features

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: Expo (React Native + Web), expo-router, @tanstack/react-query
- API: Express 5, JWT auth
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- AI: OpenAI (via `lib/integrations-openai-ai-server`)
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)
- Deploy (web): Vercel (static SPA export via `expo export --platform web`)

## Where things live

- `artifacts/ehealthmate/` — Expo mobile + web app (main product)
- `artifacts/api-server/` — Express API server (auth, AI, data)
- `lib/db/` — Drizzle schema (source of truth for DB)
- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth for API contracts)
- `lib/api-client-react/` — generated React Query hooks (do not edit manually)
- `lib/integrations-openai-ai-server/` — OpenAI client wrapper
- `vercel.json` — Vercel deployment config for the web SPA
- `DEPLOY_TO_VERCEL.md` — step-by-step Vercel deployment guide

## Vercel Deployment

See `DEPLOY_TO_VERCEL.md` for full instructions. Summary:
1. Import repo on [vercel.com/new](https://vercel.com/new)
2. Set `EXPO_PUBLIC_API_BASE_URL` to your Replit API server URL
3. Click Deploy — no other config needed (vercel.json handles everything)

## Architecture

```
Vercel (static SPA)          Replit (API server)
  Expo web export      ──▶   Express + PostgreSQL
  /dist                      /api routes
```

## Architecture Decisions

- Auth is server-side JWT + PostgreSQL (not Clerk/Replit Auth) — token stored in AsyncStorage under `auth_token_v2`
- API base URL is injected at build time via `EXPO_PUBLIC_API_BASE_URL` (Vercel) or `EXPO_PUBLIC_DOMAIN` (Replit dev)
- Expo Router web exports to `artifacts/ehealthmate/dist/` as a static SPA — Vercel serves it with SPA rewrites
- Community notification badge uses `NotificationsContext`, not `profile.notifBadge`

## User Preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Always run `pnpm --filter @workspace/api-spec run codegen` after changing `lib/api-spec/openapi.yaml`
- `EXPO_PUBLIC_API_BASE_URL` must be set in Vercel env vars or all API calls will fail on the deployed web app
- The `vercel.json` `env` block references a Vercel secret `@expo_public_api_base_url` — create this in Vercel project settings

## Pointers

- See `DEPLOY_TO_VERCEL.md` for Vercel deployment steps
- See `.agents/memory/mawibo-vercel.md` for Vercel config rationale
- See `.agents/memory/mawibo-auth.md` for auth architecture details
- See the `pnpm-workspace` skill for workspace structure details
