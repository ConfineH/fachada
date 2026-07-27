# Registro de decisiones (ADR)

Formato breve. Cada entrada: contexto → decisión → consecuencias.  
Inspirado en cómo documentamos decisiones en Meant To y Migajas para no re-debatirlas en cada sesión.

---

## ADR-001: Repository pattern con memoria por defecto

**Fecha:** 2026-07-14  
**Estado:** Aceptada

**Contexto:** Solo 2 slots Supabase cloud; Fachada no tiene usuarios reales aún.

**Decisión:** `MemoryStore` es el backend por defecto. Supabase se activa solo con `SUPABASE_SERVICE_ROLE_KEY` en env.

**Consecuencias:**
- ✅ `npm run dev` sin configuración
- ✅ Tests rápidos sin Docker
- ⚠️ Vercel sin Supabase = datos efímeros
- 📁 `src/lib/container.ts`, `src/lib/repositories/`

---

## ADR-002: No usar slot Supabase cloud (julio 2026)

**Fecha:** 2026-07-14  
**Estado:** Aceptada

**Contexto:** Meant To B2C y Migajas ocupan los 2 slots free. SiQuiero en beta necesita solución aparte.

**Decisión:** Fachada **no compite** por slot. Desarrollo local + demo Vercel. Go-live cuando haya slot o Pro.

**Consecuencias:**
- ✅ No pausamos productos con tracción
- ❌ No hay producción live con persistencia
- 📁 Ver `docs/estrategia.md`, `docs/portfolio.md`

---

## ADR-003: SMS mock con código visible en desarrollo

**Fecha:** 2026-07-14  
**Estado:** Aceptada

**Contexto:** Sin Twilio en MVP; hay que probar flujos de verificación.

**Decisión:** `MockSmsProvider` + `devCode` en respuesta API cuando `NODE_ENV !== 'production'` o `EXPOSE_DEV_SMS_CODE=true`.

**Consecuencias:**
- ✅ Flujos testeables sin SMS real
- ⚠️ En Vercel preview hay que setear `EXPOSE_DEV_SMS_CODE=true`
- 🔜 Twilio cuando haya producción
- 📁 `src/lib/services/sms-provider.ts`, `auth-service.ts`

---

## ADR-004: Next.js monolito (no API separada)

**Fecha:** 2026-07 (MVP bootstrap)  
**Estado:** Aceptada

**Contexto:** Doc original sugería Express/FastAPI. Un desarrollador, MVP acotado.

**Decisión:** Next.js 16 App Router con API Routes. Servicios en `src/lib/services/`.

**Consecuencias:**
- ✅ Un solo deploy (Vercel)
- ✅ Coherente con Migajas / Meant To
- 📁 Estructura `src/app/api/`

---

## ADR-005: SDD con OpenSpec + TDD estricto

**Fecha:** 2026-07 (MVP bootstrap)  
**Estado:** Aceptada

**Contexto:** Queremos specs revisables y tests como red de seguridad.

**Decisión:** OpenSpec en `openspec/`, `strict_tdd: true`, tests en `test/` (no colocados junto al código).

**Consecuencias:**
- ✅ Cambio MVP archivado con verify report
- ✅ Nuevas features: RED → GREEN → refactor
- 📁 `openspec/config.yaml`

---

## ADR-006: Admin con contraseña simple (no Supabase Auth)

**Fecha:** 2026-07-14  
**Estado:** Aceptada (MVP)

**Contexto:** Panel de moderación para un solo operador en fase MVP.

**Decisión:** Cookie HMAC con `ADMIN_PASSWORD`. Sin roles ni Supabase Auth para admin.

**Consecuencias:**
- ✅ Suficiente para MVP y demo
- 🔜 Revisar antes de producción pública (2FA, auth real)
- 📁 `src/lib/auth/admin-session.ts`

---

## ADR-007: Solo el owner del claim aprobado puede responder reseñas

**Fecha:** 2026-07-14  
**Estado:** Aceptada

**Contexto:** Inicialmente bastaba `agency.verified`. Cualquier usuario verificado podía responder.

**Decisión:** `ClaimService.canManageAgency()` exige claim `aprobado` del mismo `userId`.

**Consecuencias:**
- ✅ Evita suplantación de agencia
- 📁 `claim-service.ts`, tests en `claim-service.test.ts`

---

## ADR-008: Deploy Vercel permitido solo como demo

**Fecha:** 2026-07-14  
**Estado:** Aceptada

**Contexto:** Queríamos URL compartible sin slot Supabase.

**Decisión:** Vercel con modo memoria + `EXPOSE_DEV_SMS_CODE`. Documentar limitaciones. No promocionar como producto live.

**Consecuencias:**
- ✅ https://fachada-tau.vercel.app para demos visuales
- ⚠️ Datos no confiables entre sesiones
- 📁 `docs/infraestructura.md`

---

## Plantilla para nuevas decisiones

```markdown
## ADR-XXX: Título

**Fecha:** YYYY-MM-DD  
**Estado:** Propuesta | Aceptada | Superseded by ADR-YYY

**Contexto:** …

**Decisión:** …

**Consecuencias:** …
```

Al añadir una ADR, actualizar también `docs/README.md` si afecta estrategia o portfolio.
