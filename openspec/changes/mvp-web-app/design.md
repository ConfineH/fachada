# Design: Fachada MVP Web App

## Overview

Monolithic Next.js 16 app with domain-driven modules. UI pages call API routes; API routes delegate to services; services use repository interface. TDD drives all business logic in `test/`.

## Architecture

```
Browser → Next.js pages → API routes → Services → Repository → (Memory | Supabase)
                                              ↘ SmsProvider (Mock | Twilio)
```

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Framework | Next.js App Router | SSR for SEO per architecture doc |
| Styling | Tailwind CSS 4 | Fast iteration, mobile-first |
| Data (MVP) | In-memory repository | TDD without external deps |
| Data (prod path) | Supabase PostgreSQL | Matches architecture, low cost |
| Auth | Phone + 6-digit OTP | Per architecture flows |
| Validation | Zod | Type-safe schemas shared by API and tests |
| Tests | Vitest in `test/` | User-requested TDD folder |

## Data Model

Core entities: `User`, `Agency`, `Review`, `Claim`, `AgencyResponse` — aligned with architecture doc section 4.

## Key Flows

### Phone verification
1. POST `/api/auth/request-code` with `+34` phone
2. Provider sends 6-digit code (logged in dev)
3. POST `/api/auth/verify-code` marks `phoneVerified=true`, returns session token

### Write review
1. Verify session + `phoneVerified`
2. Validate role, rating 1-5, title ≤100, body ≤1000
3. Enforce 1 review per user/agency per 7 days
4. Save with `moderated=false`, publish on profile

## File Layout

```
src/lib/domain/types.ts
src/lib/domain/validation.ts
src/lib/repositories/types.ts
src/lib/repositories/memory-store.ts
src/lib/services/{auth,agency,review,claim}-service.ts
src/app/api/...
src/app/agencias/[slug]/page.tsx
test/unit/*.test.ts
test/integration/*.test.ts
supabase/migrations/001_initial_schema.sql
```

## Threat Matrix

Not applicable — no shell/VCS automation in application code.
