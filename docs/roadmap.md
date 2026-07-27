# Roadmap

## Fase actual: MVP exploratorio (sin producción live)

Fachada tiene **producto mínimo funcional** pero **infraestructura de pre-lanzamiento**. Prioridad: no bloquear Meant To ni Migajas.

## Completado ✅

### Fase 1 — Foundation
- [x] Next.js 16 + Vitest + OpenSpec
- [x] Domain types + Zod validation
- [x] MemoryStore con seed Madrid/Barcelona

### Fase 2 — Lógica de negocio (TDD)
- [x] Búsqueda de agencias
- [x] Auth SMS (mock)
- [x] Reseñas con rate limit 7 días
- [x] Claims + aprobación admin

### Fase 3 — API y UI
- [x] Home + ficha agencia
- [x] Formularios reseña y claim
- [x] Panel admin (moderación + claims)
- [x] Migraciones SQL Supabase

### Fase 4 — Post-MVP
- [x] SupabaseRepository (listo, sin cloud)
- [x] UI respuestas de agencia (`AgencyOwnerPanel`)
- [x] Deploy demo Vercel
- [x] Documentación de estrategia y portfolio

## En pausa ⏸️ (hasta slot o Pro)

| Item | Motivo |
|------|--------|
| Supabase cloud en producción | Sin slot disponible |
| Twilio SMS real | Sin usuarios reales aún |
| Dominio custom + SEO | Sin go-live |
| Monetización (perfiles premium) | Post-tracción |
| AdSense / publicidad | Post-tracción |
| Moderación automática / ML | Fuera de MVP |

## Siguiente cuando retomemos desarrollo

Orden sugerido **sin necesidad de cloud**:

1. **Filtrar reseñas públicas** — mostrar solo `moderated: true` en ficha (lógica ya en admin)
2. **Tests de integración** — flujos API end-to-end en `test/integration/`
3. **Seed ampliado** — más agencias/ciudades para demos
4. **Mejoras UX** — paginación, estados vacíos, accesibilidad

Orden sugerido **cuando haya slot Supabase**:

1. Conectar cloud + verificar migraciones
2. Twilio + quitar `EXPOSE_DEV_SMS_CODE` en prod
3. Staging con datos persistentes
4. Dominio + legal (privacidad, cookies)
5. Lanzamiento soft (Madrid primero, per doc original)

## Criterios de go-live

Marcar todos antes de tratar Fachada como Meant To / Migajas en producción:

### Infraestructura
- [ ] Slot Supabase cloud dedicado **o** Supabase Pro activo
- [ ] Variables prod en Vercel (sin `EXPOSE_DEV_SMS_CODE` en production)
- [ ] Twilio (o alternativa) configurado y probado
- [ ] Backups / política de retención definida

### Producto
- [ ] Reseñas no moderadas ocultas en público
- [ ] Flujo claim → verificación → respuesta probado con DB real
- [ ] Panel admin con contraseña fuerte (rotada desde demo)

### Legal y operación
- [ ] Política de privacidad y aviso legal (LSSI)
- [ ] Proceso de moderación documentado
- [ ] Canal de contacto para agencias y usuarios

### Tracción
- [ ] Decisión explícita de priorizar Fachada sobre otros MVPs en el portfolio
- [ ] Métrica mínima definida (ej. X agencias, Y reseñas en 30 días)

## Fases futuras (visión doc original)

| Fase | Contenido | Dependencias |
|------|-----------|--------------|
| **2** | Más ciudades, SEO, captación agencias | Go-live + slot |
| **3** | Perfiles premium, billing | Stripe + legal |
| **4** | Publicidad contextual, leads | Tráfico |
| **5** | API pública, partnerships | Escala |

Detalle de negocio en `docs/docs-extracted.txt` (secciones 5-8).

## Cómo actualizar este roadmap

1. Al completar un item → marcar `[x]` y fecha en commit o ADR
2. Al posponer → mover a "En pausa" con motivo
3. Al liberar slot → mover items de "cuando haya slot" a sprint activo
