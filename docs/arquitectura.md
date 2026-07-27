# Arquitectura

## Vista general

Monolito Next.js 16 con capas claras. Mismo patrón mental que Migajas y Meant To: páginas → API → servicios → repositorio.

```
Browser
  → App Router (RSC + client components)
  → API routes (/api/*)
  → Domain services (Auth, Agency, Review, Claim, Admin)
  → Repository interface
       ├── MemoryStore (default)
       └── SupabaseRepository (si hay SUPABASE_SERVICE_ROLE_KEY)
  → SmsProvider (MockSmsProvider; Twilio pendiente)
```

## Capas

### `src/lib/domain/`

Tipos TypeScript y schemas Zod compartidos por API y tests.

- `types.ts` — entidades: User, Agency, Review, Claim, AgencyResponse, etc.
- `validation.ts` — reglas de entrada (teléfono +34, rating 1-5, límites de texto)

### `src/lib/repositories/`

Acceso a datos detrás de una interfaz única (`Repository`).

| Implementación | Uso |
|----------------|-----|
| `memory-store.ts` | Dev, tests, demo Vercel sin DB |
| `supabase-repository.ts` | Cloud o `supabase start` local |
| `mappers.ts` | Filas SQL ↔ tipos de dominio |

Selección en `src/lib/container.ts`:

```typescript
if (isSupabaseConfigured()) return new SupabaseRepository(...)
return getMemoryStore()
```

### `src/lib/services/`

Lógica de negocio (testeada con Vitest).

| Servicio | Responsabilidad |
|----------|-----------------|
| `AuthService` | OTP SMS, sesiones |
| `AgencyService` | Búsqueda, ficha con stats y respuestas |
| `ReviewService` | Crear reseña, rate limit 7 días |
| `ClaimService` | Reclamar perfil, responder reseñas (solo owner verificado) |
| `AdminService` | Moderación y aprobación de claims |

### `src/app/`

| Ruta | Tipo |
|------|------|
| `/` | Búsqueda de agencias |
| `/agencias/[slug]` | Ficha, reseñas, forms |
| `/admin` | Panel moderación |
| `/api/auth/*` | request-code, verify-code |
| `/api/agencies/*` | listado, detalle, responses |
| `/api/reviews` | POST reseña |
| `/api/claims` | POST reclamación |
| `/api/admin/*` | login, acciones moderación |

### Componentes UI clave

| Componente | Rol |
|------------|-----|
| `PhoneVerification` | Flujo SMS compartido (reseña, claim, respuestas) |
| `ReviewForm` | Escribir reseña |
| `ClaimForm` | Reclamar perfil |
| `AgencyOwnerPanel` | Responder reseñas (owner con claim aprobado) |
| `DevBanner` | Indica memoria vs Supabase (solo dev) |

## Modelo de datos

Entidades alineadas con `supabase/migrations/`:

- **users** — teléfono verificado
- **agencies** — inmobiliarias (slug, ciudad, verified, claimed)
- **reviews** — reseñas con moderación
- **claims** — solicitudes de propiedad del perfil
- **agency_responses** — respuesta pública de la agencia a una reseña
- **pending_verifications** / **sessions** — auth OTP

Diagrama simplificado:

```
User ──< Review >── Agency
  │                    │
  └──< Claim           └──< AgencyResponse >── Review
```

## Flujos principales

### Escribir reseña

1. `POST /api/auth/request-code` → código (visible en dev)
2. `POST /api/auth/verify-code` → token de sesión
3. `POST /api/reviews` con Bearer token
4. Reseña visible en ficha (moderada vía admin)

### Reclamar y responder

1. Usuario verifica teléfono y envía claim
2. Admin aprueba en `/admin` → `agency.verified = true`
3. Mismo usuario verifica teléfono en `AgencyOwnerPanel`
4. `GET /api/agencies/[slug]/responses` → `canManage: true`
5. `POST` con `reviewId` + `body` → respuesta en ficha

### Moderación

- Reseñas nuevas: `moderated: false` hasta acción admin
- Claims: `status: pendiente` → aprobado / rechazado

## Seguridad (MVP)

| Tema | Implementación actual |
|------|------------------------|
| Admin | Cookie firmada con `ADMIN_PASSWORD` |
| API usuario | Bearer token de sesión post-SMS |
| Respuestas agencia | Solo usuario con claim **aprobado** para esa agencia |
| RLS Supabase | Definido en migración 002 (activo cuando hay cloud) |
| Service role | Solo server-side, nunca en cliente |

## Specs y tests

- Specs: `openspec/specs/{agency-search,user-auth,review-submission}/`
- Tests: `test/unit/*.test.ts` — 17 tests
- Comando: `npm test` (strict TDD en `openspec/config.yaml`)

## Diferencias vs doc de arquitectura original

`docs/docs-extracted.txt` proponía backend Express/FastAPI separado. **Decisión:** Next.js monolito (API Routes) para un solo desarrollador — misma decisión que en otros MVPs del portfolio.
