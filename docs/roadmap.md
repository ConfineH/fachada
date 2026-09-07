# Roadmap

## Fase actual: producto live con Supabase Fachada

Norte: [`producto-final.md`](./producto-final.md). Infra: [`estrategia.md`](./estrategia.md).

## Completado ✅

- [x] Next.js 16 + Vitest + dominio + MemoryStore
- [x] Auth SMS, reseñas (rate limit 7 días), claims, admin
- [x] Home, ficha, explorar, match API + extensión Idealista
- [x] Dual ratings; reseñas públicas solo moderadas
- [x] Proyecto cloud `embmicoogxrxsvchywis` + migración de tags/aliases/submissions
- [x] `/sobre`, `/metodologia`, `/agencia/acceso`
- [x] `?perspectiva=` filtra reseñas; tags de incidencia en form/ficha
- [x] Panel agencia: responder + editar web/portales/alias

## Siguiente

1. `SUPABASE_SERVICE_ROLE_KEY` en `.env.local` y Vercel (sin ella el deploy sigue en memoria)
2. Claim → aprobación → respuesta contra DB real
3. Twilio; quitar `EXPOSE_DEV_SMS_CODE` en production
4. Publicar extensión Idealista contra la URL live
5. `/cuenta`
6. Densidad ciudad piloto; premium después
7. CTA Roomeo (flag), no en el hero

## Go-live residual

- [ ] Env de producción con service_role (no anon)
- [ ] Admin password rotada
- [ ] Proceso de moderación documentado
- [ ] Canal de contacto
