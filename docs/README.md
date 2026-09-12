# Documentación Fachada

**Estado actual (12 sep 2026):** Live en https://fachada-tau.vercel.app con Supabase propio. El producto de blindaje legal ya está en código; faltan titular LSSI en Vercel, migración `012` en vivo, dictamen y SL. El norte operativo sigue siendo densidad (Madrid), no más features. Plan: [Roadmap](./roadmap.md).

## Ruta rápida

| Si quieres… | Lee esto |
|-------------|----------|
| **Definición de producto final + auditoría + backlog** | [Producto final](./producto-final.md) |
| Estado live y dirección hasta el gate de densidad | [Estrategia y estado](./estrategia.md) |
| Ver cómo encaja Fachada con el resto de proyectos | [Portfolio y slots](./portfolio.md) |
| Arquitectura técnica del código | [Arquitectura](./arquitectura.md) |
| Decisiones tomadas (y por qué) | [Registro de decisiones](./decisiones.md) |
| Cómo desarrollar, desplegar o cambiar de modo | [Infraestructura](./infraestructura.md) |
| Checklist de la semana 1 (password, LSSI, catálogo, extensión) | [Ops semana 1](./ops-semana-1.md) |
| Qué está hecho en código vs qué queda humano (legal) | [Gate legal](./legal-release-checklist.md) · [Brief abogado](./legal-review-brief.md) · [Ops RGPD](./legal-operations.md) · [Gate SL](./sl-migration-checklist.md) |
| Visión Fase 2 (dashboard, roles, historial; features) | [Producto Fase 2](./producto-fase-2.md) |
| Arrancar el proyecto en 5 minutos | [Guía de desarrollo](./desarrollo.md) |
| **Brief diseño (Stitch / UI)** | [Brief Stitch](./brief-stitch.md) |
| Contexto marketing para skills de copy | [`.agents/product-marketing.md`](../.agents/product-marketing.md) |

## Principios que guían este proyecto

1. **Densidad antes que features** — Madrid usable antes de Store, Stripe o Twilio.
2. **Repository pattern** — mismo código sirve para memoria, Supabase local o cloud.
3. **Cloud propio** — no competir por slots de Meant To / Migajas; Fachada ya tiene proyecto.
4. **SDD + TDD** — specs en `openspec/specs/`, tests en `test/`, cambios archivados en `openspec/changes/archive/`.
5. **Coherencia de stack** — Next.js + Supabase, distinta fase de madurez que el resto del portfolio.

## Fuentes de verdad

| Área | Ubicación |
|------|-----------|
| Specs funcionales | `openspec/specs/` |
| Cambio MVP archivado | `openspec/changes/archive/2026-07-14-mvp-web-app/` |
| Visión de producto (canónica ago 2026) | `docs/producto-final.md` |
| Visión de producto (doc original) | `docs/docs-extracted.txt` |
| Product marketing (skills copy/SEO) | `.agents/product-marketing.md` |
| Código de arranque | `README.md` (quick start) |

## Mantenimiento de esta documentación

Actualizar cuando cambie:

- [ ] Asignación de slots Supabase en el portfolio
- [ ] Criterios de go-live cumplidos o pospuestos
- [ ] Nueva decisión arquitectónica relevante → añadir a `decisiones.md`
- [ ] Cambio de URL de deploy o variables de entorno → `infraestructura.md`
