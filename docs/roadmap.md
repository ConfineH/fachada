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

1. Preview Vercel = mismas env que Production (Supabase + Google)
2. Quitar `EXPOSE_DEV_SMS_CODE` del dashboard si sigue
3. Twilio cuando haga falta SMS de ficha reclamada
4. Publicar extensión Idealista contra la URL live
5. Densidad ciudad piloto; premium después
6. CTA Roomeo (flag), no en el hero

## Go-live residual

- [x] Env de producción con service_role (no anon)
- [x] Google Sign-In publicado (cualquier Gmail)
- [ ] Admin password rotada (si aún es la de demo)
- [ ] Canal de contacto real (`privacidad@fachada.app` cuando haya dominio)
- [x] Moderación manual en `/admin`
