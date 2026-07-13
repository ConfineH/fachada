# Fachada

Plataforma web para buscar inmobiliarias en España y leer/escribir reseñas verificadas de inquilinos y propietarios.

## Stack

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS 4
- **Backend**: API Routes + domain services
- **Database**: In-memory store (dev) / Supabase PostgreSQL (prod path)
- **Testing**: Vitest + React Testing Library (`test/` folder, strict TDD)

## MVP Features (Phase 1)

- Buscar inmobiliarias por nombre o ciudad
- Ficha pública de agencia con reseñas
- Registro y verificación por SMS (mock en desarrollo)
- Escribir reseñas (con límite de 1 por agencia cada 7 días)
- Reclamar perfil de agencia (API)
- Responder a reseñas (agencias verificadas, API)

## Development

```bash
npm install
npm run dev      # http://localhost:3000
npm test         # TDD test suite
npm run build    # production build
```

## SDD

This project uses Spec-Driven Development. Artifacts live in `openspec/`:

- `openspec/changes/mvp-web-app/` — active MVP change
- `openspec/config.yaml` — project config with `strict_tdd: true`

## Seed Data

3 agencies are preloaded: 2 in Madrid, 1 in Barcelona.

## License

Private — all rights reserved.
