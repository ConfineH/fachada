# Roadmap — funcionar cuanto antes

Norte de producto: [`producto-final.md`](./producto-final.md).  
Plan operativo (sep 2026): densidad Madrid, no más features.

**Hecho en código (12 sep 2026), no despliega el norte:**
blindaje de reseñas (fecha, declaraciones, evidencia privada), flujo DSA
(denuncia / decisión / apelación), exportación de datos, copy y SEO on-page
(títulos, canonical, OG, sitemap, JSON-LD, metodología). **No** implica
campaña nacional ni Store. SQL `012` y el catálogo Madrid ya están en el
proyecto live. Sigue pendiente: `LEGAL_CONTACT_EMAIL` en Vercel cuando exista
`fachada.app`, y más adelante SL + titular registral. Permiso de Idealista
antes de distribuir la extensión.

## Veredicto

| Pregunta | Respuesta |
|----------|-----------|
| ¿Tesis de producto? | Sí. Archivo de **gestión** de agencias, doble lente, no catálogo. |
| ¿Plan de negocio estructurado? | Parcial. Monetización (premium €15–30) es hipótesis. Faltan N/M de ciudad, canal de primeras reseñas, y regla de “no expandir”. |
| ¿Producto para un piloto? | Sí (Google, Supabase, ficha, admin, extensión sideload). |
| ¿Tracción? | No. El siguiente trabajo es mercado + ops. |

Competencia útil: **Reviu** (piso/casero, Cataluña) y portales por **dirección**. Fachada no debe copiar eso. El hueco es la **inmobiliaria como entidad** + propietario + momento Idealista.

## Métrica de “Madrid usable”

25 fichas de agencias buscables; **10** con ≥ 2 reseñas moderadas; match Idealista ≥ 7/10 anuncios de prueba.

## 30 días

1. **Ops + catálogo:** ver [`ops-semana-1.md`](./ops-semana-1.md) — `ADMIN_PASSWORD` rotada; Madrid 25 live; `LEGAL_CONTACT_EMAIL` cuando exista el dominio.
2. **Extensión unpacked:** 10 anuncios; log de fallos de match (aliases).
3. **15 reseñas reales** (amigos / grupos). Moderar en < 24 h. Cero reseñas inventadas.
4. **Gate:** si se cumple la métrica → 5 testers con la extensión. Si no → no Store, no SEO nacional, no premium.

## Explicitamente después del gate

Twilio, Chrome Web Store, Stripe, anuncios, Roomeo, Fotocasa.

Ingeniería solo si el match falla o la cola de `/admin` duele (aviso a ficha reclamada).
