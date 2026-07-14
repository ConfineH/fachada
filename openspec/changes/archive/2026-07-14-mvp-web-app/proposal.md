# Proposal: Fachada MVP Web App

## Intent

Launch a functional web MVP for Fachada — a platform where tenants and landlords in Spain can search real estate agencies and read/write verified management reviews. Phase 1 from the roadmap requires: search, read reviews, write reviews (SMS-verified), claim agency profiles, and basic moderation.

## Scope

### In Scope
- Next.js web app with home search, results, and agency profile pages
- In-memory repository + Supabase-ready schema for agencies, users, reviews, claims
- SMS phone verification flow (mock provider for dev, Twilio-ready interface)
- Review creation with role, rating, title, body validation and 7-day rate limit
- Agency claim request and admin approval workflow (API-level)
- Agency response to reviews
- Vitest TDD suite in `test/` folder

### Out of Scope
- Production Twilio/Supabase credentials and deploy
- AdSense, premium billing, email transactional
- Full admin UI (API + seed data only for MVP)
- National rollout beyond Madrid seed data

## Capabilities

### New Capabilities
- `agency-search`: Search and list agencies by name and city
- `agency-profile`: Public agency detail page with reviews and average rating
- `user-auth`: Phone-based registration and SMS verification
- `review-submission`: Verified users write reviews with moderation flags
- `agency-claims`: Agencies request profile ownership with admin approval
- `agency-responses`: Verified agencies respond to reviews

### Modified Capabilities
- None

## Approach

Next.js App Router monolith with domain services tested via Vitest (TDD). Repository interface allows swapping in-memory store for Supabase. Spanish UI, English code. Mock SMS for local dev.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/lib/domain/` | New | Types, validation, business rules |
| `src/lib/repositories/` | New | Data access layer |
| `src/lib/services/` | New | Application services |
| `src/app/` | New | Pages and API routes |
| `test/` | New | Unit and integration tests |
| `supabase/migrations/` | New | PostgreSQL schema |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| SMS cost in production | Med | Mock provider + env-gated Twilio |
| Review abuse | Med | Rate limits + moderation flag |
| Scope creep | High | Strict MVP boundary per roadmap |

## Rollback Plan

Revert to empty scaffold via git; no production users in MVP phase.

## Dependencies

- Node.js 20+, npm
- Optional: Supabase project, Twilio account (post-MVP)

## Success Criteria

- [ ] User can verify phone and write a review
- [ ] User can search agencies and read reviews on profile page
- [ ] Agency can submit claim and respond to review (API)
- [ ] All tests pass with `npm test`
- [ ] `npm run build` succeeds
