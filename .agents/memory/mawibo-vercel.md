---
name: MAWIBO Vercel deployment
description: How the Expo web app is configured for one-click Vercel deployment.
---

## Config
- `vercel.json` at repo root
- `buildCommand`: `pnpm --filter @workspace/ehealthmate run build:web`
- `outputDirectory`: `artifacts/ehealthmate/dist`
- `installCommand`: `pnpm install --frozen-lockfile`
- All unknown routes rewrite to `/index.html` (Expo Router client-side routing)

## Required Vercel Environment Variables
- `EXPO_PUBLIC_API_BASE_URL` → full URL of the Replit API deployment (e.g. `https://my-api.replit.app`)
- Without this, the web app will have no API URL and all AI/auth features will fail

## SEO / Web Assets
- `artifacts/ehealthmate/web/index.html` — custom HTML template with OG/Twitter/PWA meta tags
- `artifacts/ehealthmate/public/og-image.png` — 1200×630 OG image (served at `/og-image.png`)
- `artifacts/ehealthmate/public/favicon.png` — app icon (served at `/favicon.png`)
- `artifacts/ehealthmate/public/manifest.json` — PWA manifest
- `artifacts/ehealthmate/app.json` — web section with full PWA metadata

**Why:** Expo Router web exports to `dist/` as a static SPA. Public/ dir assets get copied to web root unchanged, enabling static OG/favicon URLs.

**How to apply:** When deploying to Vercel, set the Replit API deployment URL as `EXPO_PUBLIC_API_BASE_URL` in Vercel project settings before the first deploy.
