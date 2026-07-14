# Fachada

Plataforma web para buscar inmobiliarias en España y leer/escribir reseñas verificadas de inquilinos y propietarios.

## Stack

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS 4
- **Database**: Repository pattern — memoria local por defecto, Supabase opcional
- **Backend**: API Routes + domain services
- **Testing**: Vitest + React Testing Library (`test/` folder, strict TDD)

## Desarrollo local (recomendado)

Fachada **no necesita Supabase cloud** para desarrollar ni probar el MVP. Por defecto usa almacenamiento en memoria con 3 agencias de ejemplo.

```bash
npm install
npm run dev      # http://localhost:3000 — sin .env necesario
npm test
npm run build
```

### Flujos que puedes probar sin cloud

1. Buscar inmobiliarias en la home
2. Escribir una reseña (SMS mock — el código aparece en pantalla en desarrollo)
3. Reclamar un perfil de agencia
4. Moderar en `/admin` (password: `fachada-admin-dev`)

## Modos de almacenamiento

| Modo | Cuándo | Configuración |
|------|--------|---------------|
| **Memoria** (default) | Desarrollo diario, TDD, explorar ideas | Ninguna — `npm run dev` |
| **Supabase local** | Probar migraciones y RLS | `supabase start` + keys locales en `.env.local` |
| **Supabase cloud** | Deploy / producción | Keys del dashboard en `.env.local` |

Sin `SUPABASE_SERVICE_ROLE_KEY`, la app usa memoria automáticamente (`src/lib/container.ts`).

## Supabase (opcional)

Copia `.env.local.example` a `.env.local` solo si quieres persistencia:

```bash
cp .env.local.example .env.local
```

Para Supabase local con Docker:

```bash
npx supabase start
# Copia API URL y service_role key que imprime el CLI a .env.local
npx supabase db reset   # aplica migraciones + seed
```

Migraciones en `supabase/migrations/`.

## Admin Panel

- URL: `/admin`
- Password (dev): `fachada-admin-dev` (override con `ADMIN_PASSWORD`)
- Aprobar/rechazar reclamaciones y moderar reseñas

## MVP Features (Phase 1)

- Buscar inmobiliarias por nombre o ciudad
- Ficha pública de agencia con reseñas
- Registro y verificación por SMS (mock en desarrollo)
- Escribir reseñas (límite de 1 por agencia cada 7 días)
- Reclamar perfil de agencia (UI + API)
- Responder a reseñas (agencias verificadas, API)
- Panel de administración

## SDD

This project uses Spec-Driven Development. Artifacts live in `openspec/`:

- `openspec/changes/mvp-web-app/` — active MVP change
- `openspec/config.yaml` — project config with `strict_tdd: true`

## Seed Data

3 agencies are preloaded: 2 in Madrid, 1 in Barcelona.

## License

Private — all rights reserved.
