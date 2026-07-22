# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Artifacts

### MAWIBO (`artifacts/ehealthmate`)

Expo (React Native) mental health and care companion built for Liberia.

- **App name**: MAWIBO (app.json slug stays `ehealthmate` for routing)
- **Tabs (5)**: Home, Chat (AI Mate), Book (doctors), Community (with notification badge), Tools. Support is accessible from home emergency CTA and drawer.
- **Header**: Compact professional bar — MAWIBO wordmark (heart icon + "MAWIBO" text) on home, page title on inner screens. Left: hamburger, right: search + notification bell.
- **NotificationsContext** (`contexts/NotificationsContext.tsx`): stores `AppNotification[]` in AsyncStorage (`mawibo_notifications_v1`). Seeds 5 community notifications on first launch. Badge shown on home header bell and Community tab. Triggered when user posts (5s after) or replies (8s after) in Community.
- **Drawer**: Material Design hamburger drawer (`components/DrawerMenu.tsx`) with sections Main / Health / Services / Settings / Support, dark mode toggle (cycles system → light → dark), and active highlight via segments. Opened from the `Header` hamburger button. State managed by `DrawerContext`.
- **Onboarding** captures name (optional), language (English / Simple English / placeholders for tribal languages), county (15 Liberian counties), and goals.
- **AI layer** (`lib/ai/`): modular AI features with cached AsyncStorage results and offline keyword fallbacks for crisis, sentiment, coping, risk, doctor-match, journal, and check-in. Re-exported via `lib/ai/index.ts`. New screens: `app/smart-match.tsx` (specialty matching from symptoms) and `app/daily-checkin.tsx` (adaptive question + sentiment-driven coping plan).
- **AIInsightsContext** orchestrates a rolling risk assessment (last 14 mood entries) and exposes `flagCrisisFromText` so the journal and chat can surface crisis support immediately. The Home screen shows a destructive risk banner when high, and a softer AI insight card when elevated/moderate.
- **Theme**: `useColors` honors `profile.themeMode` (`system` / `light` / `dark`) toggled from the drawer; persisted via AsyncStorage.
- **AI Mate** chats via the API server's `/api/ai/chat` endpoint (gpt-5-mini with crisis detection and a safety hand-off to emergency contacts).
- **Book a doctor** lists ~28 doctors across all 15 counties with filters by county and specialty, full doctor detail, and date/time slot booking. Includes a Smart Match shortcut card to `/smart-match`.
- **Tools**: box-breathing animation, guided meditations, journal (auto AI emotion+themes+reflection on save), sleep sounds, stress tips, daily check-in.
- **Support**: emergency lines (911, ambulance), NGO helplines, hospitals — tap-to-call.
- **Storage**: offline-first via AsyncStorage. No external DB. Storage keys: `profile`, `appointments`, `moods`, `journal`, `chat`, `checkin`, `mawibo_notifications_v1`.
- **Design**: Material Icons only (no emojis). Palette `#3A7BD5` primary, `#6FCF97` secondary, `#F7F9FC` background, `#1A1F2E` text. Border-radius 14.

### API Server (`artifacts/api-server`)

`routes/ai.ts` is mounted at `/api/ai`. All AI endpoints use gpt-5-mini via `@workspace/integrations-openai-ai-server` with `safeJson` parsing and `detectCrisis` safety routing where applicable.

- `POST /chat` — empathetic Liberia-context mental health chat.
- `POST /journal-summary` — 3-bullet kind reflection over recent entries.
- `POST /symptom-check` — symptom triage with crisis flag.
- `POST /affirmation` — short, mood-aware daily affirmation.
- `POST /mood-insights` — pattern summary across recent moods.
- `POST /sleep-coach` — practical sleep plan.
- `POST /sentiment` — `{emotion, intensity, score}` JSON.
- `POST /coping` — actionable coping plan with steps and a primary action route.
- `POST /risk` — multi-day risk assessment with `risk_level`, signals, guidance, suggest_support flag.
- `POST /checkin` — adaptive check-in question for time-of-day and recent mood.
- `POST /doctor-match` — recommends a specialty + urgency from symptoms.
- `POST /pre-consultation` — patient-facing summary to bring to a doctor.
- `POST /simplify` — rewrites text in Simple English.
- `POST /journal-analyze` — `{emotion, intensity, themes, reflection, crisis}` JSON.
