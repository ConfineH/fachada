# Product marketing context — Fachada

**Document version:** 1.1  
**Last updated:** 2026-09-07  

Canonical detail: [`docs/producto-final.md`](../docs/producto-final.md).  
Original vision archive: [`docs/docs-extracted.txt`](../docs/docs-extracted.txt).

## Changelog

| Version | Date | Change |
|---------|------|--------|
| 1.1 | 2026-09-07 | Reviewer identity: Google/email OTP; SMS only for agency business line |
| 1.0 | 2026-08-13 | Initial context from audit + product-final definition |

---

## 1. Product

**One-liner:** Archivo público de reputación de **gestión** de inmobiliarias en España (inquilino vs propietario).

**What it is:** Independent trust layer for how agencies treat tenants and owners — identified accounts (Google or email), moderated reviews; dual ratings; Idealista-time check via browser extension.

**What it is not:** Listings portal (Idealista/Fotocasa), listing-fraud detector, OCU-style money reclaim tool, roommate matcher (Roomeo), or heavy agency CRM.

**Category:** Proptech trust / reputation (not marketplace).

**Stage:** Local-first MVP; demo Vercel ephemeral; no cloud production until Supabase Pro/slot.

## 2. Audience

### Primary — Inquilinos
Adults searching or living in rented homes in Spain who need to know how an agency behaves (fees, deposits, repairs, communication) before signing or while stuck in a bad management relationship.

### Secondary — Propietarios
Owners deciding which agency will manage their flat; care about rent collection, vacancy, transparency — often opposite lens to tenants.

### Tertiary — Inmobiliarias
Agencies that want to claim profiles, respond to reviews, and later pay for premium visibility — after public density exists.

### Jobs to be done
- Before signing / before contacting from Idealista: “Can I trust this agency’s management?”
- After a painful experience: “Leave a useful, role-tagged review.”
- Agency: “Defend and maintain our public reputation.”

## 3. Positioning

**Against Idealista/Fotocasa:** They show the flat; Fachada shows how the **agency manages** people. No catalog competition.

**Against Google Reviews:** Google mixes offices, sales, and random visits. Fachada separates **inquilino** and **propietario** and focuses on rental/management experience.

**Against OCU/Facua:** They help reclaim money / denounce. Fachada surfaces **patterns** (tags) and links out; does not run legal claims.

**Unique value:** Dual-lens management reputation + structured incident tags (Ley Vivienda–era pains) + check-at-listing-time (extension).

## 4. Messaging

**Primary promise:** Antes de firmar (o de encargar la gestión), mira cómo trata esa inmobiliaria a inquilinos y a propietarios.

**Proof points (aspirational until density):** Dual scores; identified accounts (Google or email); moderation; methodology page; incident tags (honorarios, fianza, reparaciones…).

**Tone:** Calm, institutional-editorial, independent archive. Not urgent SaaS, not Idealista-green portal, not Meant To warmth.

**Copy rules:**
- Never claim absolute anonymity (email identified in backend; public display is non-identifying).
- Never promise antifraud for Idealista ads.
- CTAs: prefer “buscar / leer / reseñar” over “añadir agencia” as primary.
- Agency nav must lead to real Acceso, not `/explorar`.

**Hero / acquisition line (Idealista extension):**  
“Buscas piso en Idealista. ¿Sabes cómo trata esa inmobiliaria a los inquilinos? Fachada te lo dice.”

## 5. Offer

**Consumer:** Free to read and write (Google or email code).

**Agency:** Free claim + respond; later **premium** (€15–30/mes aspirational) for highlight, richer stats, priority reply — only after city density.

**Not early:** AdSense / heavy contextual ads (trust risk).

## 6. Ecosystem

- **Fachada = destination** while Roomeo is built in parallel.
- When Roomeo exists: secondary CTA/waitlist (“¿compartes piso?”), not hero identity.
- Portfolio: behind Migajas + Meant To B2C in hours; ahead of freeze-only MVPs when in destination mode.

## 7. Channels (priority order)

1. Idealista-time extension (primary distribution wedge)
2. SEO city + agency pages (needs go-live + content)
3. Associations / tenant orgs (outreach, not build dependency)
4. Agency outbound after density

## 8. Objections

| Objection | Response |
|-----------|----------|
| “Google already has reviews” | Not split by tenant/owner management; not structured for rental agency behavior |
| “Idealista should fix agencies” | Idealista sells listings; incentive misaligned; Fachada is independent |
| “Reviews will be fake” | Identified account + moderation + agency dispute path; methodology public |
| “Nobody will leave reviews” | High emotion market (fees, deposits); still needs ops + positioning |

## 9. Skills / docs to use with this context

- Copy: `.agents/skills/copywriting`, `copy-editing`, `copywriting-tone-of-voice-creator`
- Content/SEO: `content-strategy`, `seo`, `seo-audit`
- Design/motion: `impeccable`, `emil-design-eng`, `brief-stitch.md`
- Full product definition: `docs/producto-final.md`
