# Documentación Fachada

**Estado actual:** MVP funcional en desarrollo local. **No hay producción live** con datos persistentes — los 2 slots de Supabase cloud están asignados a Meant To B2C y Migajas.

## Ruta rápida

| Si quieres… | Lee esto |
|-------------|----------|
| **Definición de producto final + auditoría + backlog** | [Producto final](./producto-final.md) |
| Entender por qué no está live y qué hacemos mientras tanto | [Estrategia y estado](./estrategia.md) |
| Ver cómo encaja Fachada con el resto de proyectos | [Portfolio y slots](./portfolio.md) |
| Arquitectura técnica del código | [Arquitectura](./arquitectura.md) |
| Decisiones tomadas (y por qué) | [Registro de decisiones](./decisiones.md) |
| Cómo desarrollar, desplegar o cambiar de modo | [Infraestructura](./infraestructura.md) |
| Qué está hecho y qué viene después | [Roadmap](./roadmap.md) |
| Visión Fase 2 (dashboard, roles, historial; features) | [Producto Fase 2](./producto-fase-2.md) |
| Arrancar el proyecto en 5 minutos | [Guía de desarrollo](./desarrollo.md) |
| **Brief diseño (Stitch / UI)** | [Brief Stitch](./brief-stitch.md) |
| Contexto marketing para skills de copy | [`.agents/product-marketing.md`](../.agents/product-marketing.md) |

## Principios que guían este proyecto

1. **Local-first** — desarrollo sin depender de cloud (como fase exploratoria de otros MVPs).
2. **Repository pattern** — mismo código sirve para memoria, Supabase local o cloud.
3. **No competir por slots** — hasta liberar slot o pasar a Supabase Pro, Fachada no usa cloud.
4. **SDD + TDD** — specs en `openspec/specs/`, tests en `test/`, cambios archivados en `openspec/changes/archive/`.
5. **Coherencia con Meant To y Migajas** — mismo stack base (Next.js + Supabase-ready), distinta fase de madurez.

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
