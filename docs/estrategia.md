# Estrategia y estado

## Respuesta en una línea

**Producto live (Vercel + Supabase). El cuello de botella es densidad en Madrid, no features. Plan de 30 días: [`roadmap.md`](./roadmap.md).**

## Situación actual (septiembre 2026)

| Dimensión | Estado |
|----------|--------|
| Código MVP | ✅ Ficha dual, tags, Glassdoor-style, `/cuenta`, claim/panel, admin |
| Tests | ✅ Vitest + build |
| Deploy | ✅ https://fachada-tau.vercel.app |
| Supabase | ✅ `embmicoogxrxsvchywis` |
| Auth reseñas | ✅ Google Sign-In + email OTP (no Twilio) |
| Datos | Seed; **sin tracción** (reseñas reales ≈ 0) |
| SMS ficha agencia | ❌ Twilio solo cuando haga falta línea de negocio |

Sin env de Supabase, `MemoryStore` (tests). Auth de usuarios **no** es Supabase Auth.

Env: `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` (no la anon key; no commit). RLS revoke: el server usa `service_role`.

## Dirección (no negociable hasta el gate)

1. 25 fichas Madrid reales + 15 reseñas reales moderadas.
2. Extensión unpacked: medir match Idealista (objetivo ≥ 7/10).
3. `src/lib/legal.ts` con titular real. Rotar `ADMIN_PASSWORD`.
4. Gate “Madrid usable”: 10 fichas con ≥ 2 reseñas; entonces testers. **No** Store / Stripe / Twilio / SEO nacional antes.

No mezclar datos con Meant To ni Migajas.
