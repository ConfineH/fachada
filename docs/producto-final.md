# Fachada — Producto final

**Fecha:** 2026-09-06 · **Revisión:** 2026-09-12  
**Estado:** Definición de producto vigente; Supabase cloud de Fachada activo.  
**Hecho desde la auditoría de agosto:** metodología pública, acceso agencias real, taxonomía de incidencias, copy sin «reseña verificada» ni anonimato absoluto, SEO on-page. La tabla de hallazgos UX más abajo es histórica: varios huecos ya están cerrados.  
**Contexto marketing corto:** [`.agents/product-marketing.md`](../.agents/product-marketing.md)  
**Visión original (archivo):** [`docs-extracted.txt`](./docs-extracted.txt) · Fase 2 features: [`producto-fase-2.md`](./producto-fase-2.md)

---

## 1. Qué es el producto final

**Una frase:** Archivo público de reputación de **gestión** de inmobiliarias en España, con doble lente inquilino/propietario, cuenta identificada y reseñas moderadas, taxonomía de incidencias alineada al dolor post–Ley de Vivienda y, solo si existe autorización o un diseño compatible, contexto durante la búsqueda en portales; gratuito para ciudadanos; portal ligero para agencias; puente opcional a Roomeo cuando exista.

### Qué no es

| No es | Por qué |
|-------|---------|
| Idealista / Fotocasa | Sin catálogo de pisos; no competir en listings |
| Detector de anuncios falsos | Problema del portal; fuera de scope |
| OCU / Facua | No gestiona reclamaciones económicas; enlaza, no litiga |
| Roomeo | Matching roommates es otro producto; aquí solo CTA secundario |
| CRM B2B pesado | Portal agencia = reputación, no cartera de inmuebles |

### Superficies

| Superficie | Job | Must-have |
|------------|-----|-----------|
| Público / SEO | Decidir antes de firmar o encargar gestión | Explorar ciudad, ficha dual, tags de incidencias, metodología, ranking por densidad + nota |
| Escritura | Dejar evidencia útil | Google o correo, rol, rating, checklist incidencias, moderación, `/cuenta` |
| Idealista-time | Confiar sin salir del anuncio | Extensión + API match; Fotocasa después |
| Inmobiliaria | Defender y mantener ficha | Acceso real, claim, responder, editar portales/alias/contacto, stats por rol, impugnar reseña |
| Admin / ops | Calidad del archivo | Colas claim / reseñas / submissions; proceso documentado |
| Puente ecosistema | Más adelante | CTA “¿compartes piso?” → Roomeo (secundario, no hero) |

### Monetización (orden)

1. Densidad + confianza (gratis para usuarios).
2. **Premium agencia** (destacado, stats, respuesta prioritaria) — alineado con €15–30/mes del plan original.
3. Leads / publicidad contextual — solo con tráfico; **no AdSense temprano** (mata confianza).

### Criterios de éxito (destino)

- Ciudad piloto con densidad usable (definir N agencias con ≥ M reseñas moderadas).
- % reseñas con ≥ 1 tag de incidencia.
- Extensión → clics a ficha medibles.
- Agencias reclamadas que responden (señal B2B).
- Metodología visitada desde ficha/footer.

### Relación con Roomeo

Fachada es **destino** mientras Roomeo no está listo, y se construye Roomeo **en paralelo**. Cuando Roomeo exista, Fachada sigue siendo destino de trust **y** capa/puente; no se apaga.

---

## 2. Auditoría × pain points del mercado ES

### Cobertura actual vs dolor real

| Pain de mercado | Cobertura hoy | Hueco |
|-----------------|---------------|-------|
| Gestión distinta inquilino vs propietario | Dual ratings + rol en reseña | `?perspectiva=` no filtra la lista; copy de lente incompleta |
| Honorarios / SAI / seguros impuestos (OCU, Facua, multa Alquiler Seguro) | Solo prosa libre | **Taxonomía de incidencias** en form + ficha |
| Confianza mientras miras anuncio en Idealista | API match + extensión local | Publicar extensión; alias/portales editables por agencia |
| Google Reviews genérico | Posicionamiento correcto | Página **Metodología** (footer hoy apunta a aviso legal) |
| Agencia quiere gestionar reputación | Claim + responder | Hub Acceso, editar ficha, stats, reportar fake |
| Estafas de anuncio / depósito anticipado | Fuera de scope (correcto) | No construir antifraude de listings |
| Recuperar dinero ante Consumo | Fuera de scope (correcto) | Enlaces a OCU/Facua, no producto legal |

### Hallazgos UX / UI / copy (ago 2026)

| Hallazgo | Evidencia típica | Impacto |
|----------|------------------|---------|
| Identidad “archivo independiente” creíble | Home + ficha + brief Stitch | Base buena |
| CTA torcido hacia supply | “Añadir agencia” más fuerte que reseñar / decidir | Diluye job del usuario |
| Overclaim de anonimato | Copy “Anonimato garantizado” vs SMS | Riesgo confianza/legal copy |
| Acceso agencias stub | Nav → `/explorar` | Agencia no encuentra producto |
| Sobre / metodología mal enlazados | Footer → explorar o solo legal | Trust theater |
| Perspectiva a medias | `?perspectiva=` no sincroniza filtros | UVP dual incompleta en UX |
| Portal agencia ~30% | Solo responder; sin editar ficha ni hub | No es producto B2B semanal |
| Motion tokens buenos | `globals.css` + Reveal + reduced-motion | Por encima de MVP típico |
| Marca aún genérica | Geist + stone | Pulible sin rebrand total |

### Perspectiva inmobiliaria (estado preciso)

**Existe, delgada:** claim multi-paso → admin aprueba → `/agencia/[slug]/panel` → responder reseñas.

**No existe aún:** Acceso sin conocer slug, editar Idealista/Fotocasa/alias, stats ricos, impugnar reseña, billing premium, equipo multi-asiento.

---

## 3. Alineación vs plan original

Fuentes: `docs-extracted.txt`, `producto-fase-2.md`, roadmap histórico.

| Idea original | Veredicto |
|---------------|-----------|
| UVP: reseñas de gestión inquilino/propietario vs Idealista/Google | **Mantener** — norte correcto |
| SMS, claim, responder, admin, Madrid-first | **Mantener** — casi en código |
| Extensión Idealista como distribución | **Mantener y subir prioridad** |
| Premium / leads / AdSense | **Mantener como fase**; retrasar AdSense |
| Ranking por reputación | **Mantener**; aún falta UI de producto |
| Partnership asociaciones inquilinos | **Mantener** como canal, no bloqueante de build |
| Fachada solo wedge hasta Roomeo | **Ajustar** — destino + Roomeo en paralelo |
| Ficha = destino de decisión | **Endurecer** con tags + metodología |
| Portal agencia mínimo | **Ampliar ligeramente** (hub + editar ficha); no CRM |
| Anonimato absoluto en copy | **Corregir** — seudónimo público + teléfono verificado en backend |

### Cambios materiales respecto al plan original

1. Taxonomía de incidencias (Ley Vivienda / abusos tipificados).
2. Página metodología real.
3. Acceso agencias real + panel editable.
4. `/cuenta` (mis reseñas).
5. Perspectiva UX coherente (filtro + copy).
6. Puente Roomeo explícito pero secundario.
7. Exclusión explícita: antifraude listings y reclamación económica.
8. Premium **después** de densidad, no como validación prematura.

---

## 4. Skills de agente instaladas (ago 2026)

Copiadas desde Migajas / Meant To para alinear copy, SEO y review con el resto del portfolio:

| Skill | Origen |
|-------|--------|
| `copywriting`, `copy-editing`, `content-strategy`, `product-marketing` | Migajas |
| `seo`, `seo-audit`, `web-design-guidelines`, `vercel-react-best-practices` | Migajas |
| `copywriting-tone-of-voice-creator`, `nextjs-code-review` | Meant To |

Ya presentes (diseño/motion): `impeccable`, `emil-design-eng`, `apple-design`, `design-taste-frontend`, `animation-vocabulary`, `find-animation-opportunities`, `improve-animations`, `review-animations`, `stitch-design-taste`, etc.

Al escribir copy o auditar UI, leer primero `.agents/product-marketing.md` y este documento.

---

## 5. Backlog — shaping (histórico; ya no es “ahora”)

Objetivo de entonces: producto *shaped* y demoable. Cloud ya está. El “ahora” operativo es [`roadmap.md`](./roadmap.md).

| # | Item | Notas |
|---|------|--------|
| 1 | Skills + docs de visión | Este pase |
| 2 | Copy / trust | CTAs home; matizar anonimato; Sobre + Metodología reales |
| 3 | Nav Acceso agencias | Landing claim/panel; quitar stubs |
| 4 | Perspectiva sincronizada | `?perspectiva=` filtra lista + copy de lente |
| 5 | Taxonomía incidencias | Tags: `honorarios_gestion`, `seguro_impuesto`, `fianza`, `reparaciones`, `comunicacion`, `renovacion`, `otros` — UI + MemoryStore + tests; migración SQL lista para cloud |
| 6 | Hub agencia | `/agencia/acceso` + editar portales/alias; empty states |
| 7 | Seed ampliado | Ciudades/agencias/reseñas divergentes + tags |
| 8 | Motion/UI polish | Menos card-theater; sin rebrand completo |
| 9 | Extensión sideload | README instalación; copy del badge |

**Fuera de “ahora”:** Twilio prod, SEO indexable con datos reales, billing, ML moderación, Chrome Web Store / Fotocasa store.

### Ya hecho (no repetir como “siguiente”)

- Filtro público solo reseñas `moderated: true`
- Dual ratings + pestañas por rol (parcial; falta sync perspectiva)
- API `match` + extensión Idealista MVP
- Alias en ficha, panel responder, legal pages básicas
- SupabaseRepository + cloud (`embmicoogxrxsvchywis`)

---

## 6. Backlog — con Supabase (Pro o slot)

| # | Item |
|---|------|
| 1 | ~~Cloud + migraciones~~ hecho (`embmicoogxrxsvchywis`) |
| 2 | Twilio real cuando haga falta SMS de ficha |
| 3 | Soft launch ciudad piloto + canal contacto (dominio) |
| 4 | SEO ciudad/ficha + pasar `seo-audit` |
| 5 | ~~`/cuenta`~~ hecho; alertas de reseña nueva a agencia claimada |
| 6 | Publicar extensión Idealista; luego Fotocasa |
| 7 | Impugnar reseña (agencia) + flujo admin |
| 8 | Premium Stripe cuando haya densidad + N reclamadas |
| 9 | CTA/waitlist Roomeo (feature flag) |
| 10 | KPIs: reseñas/mes, agencias verificadas, ratio flagged, respuestas |

Checklist go-live detallado: [`roadmap.md`](./roadmap.md).

---

## 7. Orden de ejecución recomendado (producto)

```text
Sin cloud:
  copy/trust + nav Acceso
  → perspectiva sync
  → tags incidencias (dominio+UI+tests+migración)
  → hub agencia (editar ficha)
  → seed + polish + extensión sideload

Con cloud (sep 2026):
  ops Madrid + reseñas reales + match extensión
  → gate densidad
  → SEO + aviso a agencia + impugnación
  → Store / Twilio / premium / Roomeo
```

---

## 8. Referencias rápidas de código

| Área | Ruta |
|------|------|
| Home | `src/app/page.tsx` |
| Explorar / ciudad | `src/app/explorar/page.tsx`, `src/app/ciudades/[city]/page.tsx` |
| Ficha | `src/app/agencias/[slug]/page.tsx` |
| Panel agencia | `src/app/agencia/[slug]/panel/page.tsx` |
| Nav / footer | `src/components/site-nav.tsx`, `site-footer.tsx` |
| Claim / respond | `src/components/claim-form.tsx`, `agency-owner-panel.tsx` |
| Extensión | `extension/idealista/` |
| Verificación claims | `docs/verificacion-inmobiliarias.md` |
