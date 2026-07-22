# 🚀 Deploy MAWIBO to Vercel

This repo is pre-configured for Vercel. Follow the steps below to go live.

---

## Step 1 — Import the repo into Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **"Import Git Repository"**
3. Select **MAWIBO-Mobile-App** from `itechnetworkafrica-gif`
4. Vercel will auto-detect the settings from `vercel.json` — **no manual config needed**

---

## Step 2 — Set the required environment variable

Before clicking Deploy, add this environment variable in Vercel's project settings:

| Name | Value |
|------|-------|
| `EXPO_PUBLIC_API_BASE_URL` | The full URL of your Replit API server, e.g. `https://mawibo-api.replit.app` |

> **Important:** Without this, the web app will load but AI, auth, and all API features will fail.

To find your Replit API URL:
- Publish the `artifacts/api-server` artifact in Replit
- Copy the resulting `*.replit.app` URL and paste it as the value above

---

## Step 3 — Click Deploy

Vercel will:
1. Run `pnpm install --frozen-lockfile`
2. Run `pnpm --filter @workspace/ehealthmate run build:web` (Expo web export)
3. Serve `artifacts/ehealthmate/dist/` as a static SPA

Expected build time: **3–5 minutes**

---

## Vercel Configuration Summary (`vercel.json`)

```json
{
  "buildCommand": "pnpm --filter @workspace/ehealthmate run build:web",
  "outputDirectory": "artifacts/ehealthmate/dist",
  "installCommand": "pnpm install --frozen-lockfile"
}
```

All client-side routes are rewritten to `/index.html` so Expo Router navigation works correctly.

---

## Subsequent Deploys

Every `git push` to the `main` branch will trigger an automatic Vercel redeploy. No further manual steps needed.

---

## Architecture

```
┌─────────────────────────┐     ┌──────────────────────────┐
│  Vercel (static SPA)    │────▶│  Replit API Server        │
│  Expo web app           │     │  Express + PostgreSQL      │
│  artifacts/ehealthmate  │     │  artifacts/api-server      │
└─────────────────────────┘     └──────────────────────────┘
```

The Expo web frontend runs as a fully static site on Vercel. It calls the Replit-hosted Express API for auth, AI features, doctor booking, and data persistence.
