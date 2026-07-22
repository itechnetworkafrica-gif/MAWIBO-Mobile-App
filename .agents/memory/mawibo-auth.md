---
name: MAWIBO auth architecture
description: Server-side JWT auth with PostgreSQL — replaces old AsyncStorage-only auth.
---

## Architecture
- **Server**: `artifacts/api-server/src/routes/auth.ts` — 4 endpoints mounted at `/api/auth/`
  - `POST /register` → bcrypt hash, insert users table, return JWT
  - `POST /login` → bcrypt compare, return JWT  
  - `GET /me` → verify JWT, return user
  - `PATCH /me` → verify JWT, update bio/county/avatarColor
- **Database**: `lib/db/src/schema/users.ts` — `users` table with uuid PK, username, email, passwordHash, county, bio, avatarColor, createdAt, updatedAt
- **JWT**: signed with `SESSION_SECRET` env var, expires in 30 days, payload = `{ userId }`
- **Packages**: `bcryptjs` + `jsonwebtoken` in api-server dependencies

## Client (AuthContext)
- Token stored in AsyncStorage under key `auth_token_v2`
- On mount: reads token → calls `/api/auth/me` → restores session
- `getApiBase()` checks `EXPO_PUBLIC_API_BASE_URL` first (for Vercel), then `EXPO_PUBLIC_DOMAIN` (Replit)
- `allUsers` (for community display) still cached locally in `auth_users_v1` AsyncStorage key

**Why:** Old auth used `simpleHash` (XOR hash — not secure) and stored all user data locally (no cross-device). New arch has proper bcrypt + persistent PostgreSQL storage.

**How to apply:** Any new auth-related endpoints should follow the same JWT extraction pattern (`extractToken` → `verifyToken` → query DB). Never store passwords client-side.
