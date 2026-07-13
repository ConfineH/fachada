# Tasks: MVP Web App

## Phase 1 — Foundation

- [x] 1.1 Initialize Next.js + Vitest + openspec config
- [x] 1.2 Create domain types and Zod validation schemas
- [x] 1.3 Create in-memory repository with Madrid seed agencies

## Phase 2 — TDD Business Logic

- [x] 2.1 RED: agency search tests → GREEN: AgencyService.search
- [x] 2.2 RED: auth tests → GREEN: AuthService with mock SMS
- [x] 2.3 RED: review tests → GREEN: ReviewService with rate limits
- [x] 2.4 RED: claim tests → GREEN: ClaimService

## Phase 3 — API & UI

- [x] 3.1 API routes for auth, agencies, reviews, claims
- [x] 3.2 Home page with search
- [x] 3.3 Agency profile page
- [x] 3.4 Supabase migration SQL (schema only)

## Phase 4 — Verify

- [ ] 4.1 Run `npm test` — all green
- [ ] 4.2 Run `npm run build` — succeeds
- [ ] 4.3 Push to GitHub

## Review Workload Forecast

- Estimated changed lines: ~800
- 400-line budget risk: High
- Chained PRs recommended: No (greenfield MVP, single initial commit)
- Decision needed before apply: No
- Chain strategy: single-pr
