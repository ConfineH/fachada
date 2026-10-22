# Fachada

Plataforma web para buscar inmobiliarias en España y leer/escribir experiencias de inquilinos y propietarios con cuenta identificada y moderación.

> **Estado:** Producción live en [fachada.app](https://fachada.app), con Supabase (datos persistentes) y Resend (correo).  
> **Documentación completa:** [`docs/`](./docs/README.md)

## Quick start

```bash
npm install
npm run dev      # http://localhost:3000 — sin .env necesario
npm test
```

## Stack

- Next.js 16 · React 19 · Tailwind CSS 4
- Repository pattern: memoria en local (sin `.env`) · Supabase en producción
- Correo: Resend en producción
- Vitest + OpenSpec (SDD/TDD)

## Producción

https://fachada.app — live, con Supabase y Resend. El host `fachada-tau.vercel.app` redirige aquí.

Si el Congreso no convalida el RDL 29/2026 (plazo hacia el 13/11/2026), poner `REFORM_2026_ACTIVE = false` en `src/lib/domain/tools/constants.ts` y desplegar.

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
