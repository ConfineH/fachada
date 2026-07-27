# Fachada

Plataforma web para buscar inmobiliarias en España y leer/escribir reseñas verificadas de inquilinos y propietarios.

> **Estado:** MVP funcional en desarrollo local. **No hay producción live** con datos persistentes — los slots Supabase cloud están asignados a Meant To B2C y Migajas.  
> **Documentación completa:** [`docs/`](./docs/README.md)

## Quick start

```bash
npm install
npm run dev      # http://localhost:3000 — sin .env necesario
npm test
```

## Stack

- Next.js 16 · React 19 · Tailwind CSS 4
- Repository pattern: memoria (default) · Supabase opcional
- Vitest + OpenSpec (SDD/TDD)

## Demo (efímera, sin DB)

https://fachada-tau.vercel.app — navegable; los datos **no persisten** entre sesiones. Ver [limitaciones](./docs/infraestructura.md#limitaciones-demo-importante).

## Documentación

| Doc | Contenido |
|-----|-----------|
| [Índice](./docs/README.md) | Mapa de toda la documentación |
| [Estrategia](./docs/estrategia.md) | Por qué no está live y qué hacemos |
| [Portfolio](./docs/portfolio.md) | Slots Supabase y coherencia con otros proyectos |
| [Arquitectura](./docs/arquitectura.md) | Capas, flujos, modelo de datos |
| [Decisiones](./docs/decisiones.md) | ADRs — decisiones que no re-debatir |
| [Infraestructura](./docs/infraestructura.md) | Env, Vercel, Supabase local/cloud |
| [Roadmap](./docs/roadmap.md) | Hecho, pausado, criterios go-live |
| [Desarrollo](./docs/desarrollo.md) | TDD, flujos manuales, convenciones |

## MVP features

- Buscar inmobiliarias · ficha con reseñas
- Verificación SMS (mock) · escribir reseña · reclamar perfil
- Respuestas de agencia (owner verificado) · panel admin

## License

Private — all rights reserved.
