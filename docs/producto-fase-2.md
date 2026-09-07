# Fachada — Visión producto Fase 2 (local-first)

**Estado:** P0+P1 implementados en local (ago 2026). Sin cloud hasta staging beta; **Supabase Pro al abrir beta** (ver abajo).  
**Gap actual:** MVP backend + ficha mínima; falta exploración visual (dashboard, filtros, perspectivas).

## Identidad: nombre comercial primero (decisión de producto)

**Lo que ve y busca la gente:** “Inmobiliaria Javier”, como en Idealista — no el CIF ni la denominación social.

| Capa | Uso | Visible al usuario |
|------|-----|-------------------|
| **Nombre comercial** (`name`) | Búsqueda, slug, SEO, título de ficha | ✅ Siempre |
| **Alias / nombres anteriores** | “También conocida como…”, búsqueda, investigar reseñas viejas en Google | ✅ En ficha, sección secundaria |
| **CIF + denominación legal** | Dedup interno, claims, moderación, historial registral | Opcional en ficha (“Datos legales”) |

**Las reseñas en Fachada** se muestran y se escriben en contexto del **nombre comercial actual**. En base de datos siguen ligadas a `agencyId` estable (para que un cambio de nombre no las pierda), pero el usuario **nunca** tiene que conocer el CIF.

**Historial de nombres (comercial y/o legal):** ayuda a alguien que busca en Google Reviews “Inmobiliaria X antigua” — enlaces o texto “antes se llamaba…”. No sustituye al nombre comercial en búsqueda principal.

```text
Agency
  id, slug
  name              ← nombre comercial (principal)
  legalName?, cif?  ← verificación / admin
  city, ...

AgencyNameAlias
  agencyId
  alias             ← comercial o legal anterior
  kind: commercial | legal
  effectiveUntil?
  sourceUrl?        ← BORME, web, admin
  note?             ← "Útil para buscar reseñas antiguas en Google"
```

## Qué existe hoy (para no re-inventar)

| Superficie | Ruta | Notas |
|------------|------|--------|
| Búsqueda + listado | `/` | Por texto (nombre/ciudad) — ya orientado a nombre comercial |
| Ficha agencia | `/agencias/[slug]` | Reseñas, escribir, reclamar, responder (owner) |
| Moderación | `/admin` | Claims + reseñas |
| Rol en reseña | `inquilino` \| `propietario` | Falta UI de medias separadas (P0 beta) |

## Tres perspectivas de producto

```
                    ┌─────────────────┐
                    │  Público / SEO  │
                    │  Explorar, leer │
                    └────────┬────────┘
                             │
         ┌───────────────────┼───────────────────┐
         ▼                   ▼                   ▼
  Usuario (lectura)   Usuario (escritura)   Inmobiliaria
  sin login           SMS verificado        claim aprobado
```

### 1. Público — explorar y confiar

| Feature | Prioridad | Notas |
|---------|-----------|--------|
| Dashboard `/explorar` + por **ciudad** | **P0** | |
| **Dos valoraciones visibles** (inquilino / propietario) | **P0** | No una media única engañosa |
| Ficha: pestañas/filtros por rol + copy “lo que te importa si eres…” | **P0** | |
| Filtros valoración mínima, nº reseñas | P1 | |
| **API match agencia** (para extensión Idealista/Fotocasa) | **P1** |
| **Extensión navegador** (badge reseñas en anuncio) | **P1** o P1.5 post-beta web |
| Alias / nombres anteriores | **P1** |
| URLs portal en ficha (opcional, secundario) | P1 baja |
| Solo reseñas `moderated: true` en público | **P1** | Confianza en beta |
| País, mapas, fuera de ES | P2+ | |

### 2. Usuario — una web, dos lentes (sin dos apps)

- Media y reseñas **separadas por rol** en ficha (crítico si la agencia va bien con propietarios y mal con inquilinos).
- Hero opcional `?perspectiva=inquilino|propietario`.
- Al escribir: selector de rol (actual).

### 3. Inmobiliaria — portal verificado

| Feature | Prioridad |
|---------|-----------|
| `/agencia/panel` | P1 |
| Responder reseñas (mover desde ficha) | P1 |
| Editar enlaces a portales (Idealista, etc.) | P1 |
| Stats por rol | P1 |

## Idealista / Fotocasa — reseñas de gestión (sin reviews en portales)

**Problema:** En Idealista/Fotocasa ves el piso y el nombre de la inmobiliaria, pero **no hay reseñas de cómo gestionan** (solo el anuncio). Ese hueco es Fachada.

**Objetivo de producto:** Mientras alguien mira un anuncio, **comprobar en segundos** si en Fachada hay opiniones de inquilinos/propietarios sobre **esa agencia** — sin salir del flujo de búsqueda de piso (o con un clic).

**No es:** importar datos de Idealista, enlazar catálogo, ni competir con su listado.

### Enfoque recomendado: extensión de navegador (+ API de matching)

| Pieza | Rol |
|-------|-----|
| **Extensión** (Chrome / Firefox / Edge) | En `idealista.com` / `fotocasa.es`, lee del DOM el **nombre de la inmobiliaria** (y ciudad si está) del anuncio abierto |
| **API pública Fachada** | `GET /api/agencies/match?name=...&city=...` → mejor coincidencia, slug, media inquilino/propietario, nº reseñas, enlace a ficha |
| **UI ligera** | Badge o panel: “Fachada: 4.2 inquilinos · 3.1 propietarios · 12 reseñas” + “Ver en Fachada” / “Sin reseñas aún” |

La extensión **no** scrapea Idealista en servidor; solo usa lo que el usuario ya ve en su pestaña (content script). ToS: enfoque “lectura en cliente del HTML que el usuario carga”, no API no autorizada de terceros — aun así conviene revisar ToS antes de publicar en Chrome Web Store.

### Alternativas más simples (fallback)

| Opción | Cuándo |
|--------|--------|
| **Bookmarklet** | “Buscar esta agencia en Fachada” — usuario selecciona texto o usa URL; sin tienda de extensiones |
| **Búsqueda en fachada.app** | Copiar nombre desde Idealista; peor UX, cero mantenimiento DOM |
| **Widget solo para agencias** | No resuelve el caso “estoy mirando un piso en Idealista” |

La extensión es el producto que encaja con tu idea; bookmarklet como v0 de validación.

### Matching (el reto técnico)

Idealista puede mostrar “Inmobiliaria Javier”, “JAVIER INMOBILIARIA SL”, sucursal Madrid… Fachada tiene `name` + alias + ciudad.

- Matching por **nombre normalizado + ciudad** (fuzzy score).
- Respuesta con **confianza** (“¿Es esta?” si hay ambigüedad).
- Admin/claim: agencias pueden registrar **alias** y URL de su perfil en portal para mejorar match (P1).

### Prioridad

| Item | Prioridad |
|------|-----------|
| API `match` + búsqueda por alias | **P1** (prerrequisito extensión) |
| Extensión MVP (Idealista primero, Fotocasa después) | **P1** para beta diferenciada, o **P1.5** justo tras beta web si el tiempo aprieta |
| Enlaces “ver anuncios” en ficha Fachada | P1 opcional (secundario respecto a extensión) |
| Partnership oficial con portales | P2+ |

### Beta sin extensión

Se puede abrir beta **solo web** (explorar + ficha + doble rating). La extensión es el **gancho de distribución** (“úsala cuando busques piso”); planificarla en P1 si hay capacidad, no bloquear beta web por ella.

### Mensaje marketing

> “Buscas piso en Idealista. ¿Sabes cómo trata esa inmobiliaria a los inquilinos? Fachada te lo dice sin salir del anuncio.”

## Arquitectura de rutas (objetivo)

```text
/                          Home + búsqueda
/explorar                  Dashboard por ciudad
/ciudades/[city]           Listado
/agencias/[slug]           Ficha (doble rating, roles, alias, enlaces portales)
/agencia/panel             Portal inmobiliaria
/cuenta                    Mis reseñas (P1)
/admin                     Moderación
```

## P0 + P1 (alcance antes de beta) — resumen

### P0 — Imprescindible para que la beta tenga sentido

- [x] Nav + `/explorar` + listados por ciudad
- [x] Ficha con **rating inquilino** y **rating propietario** (y conteos)
- [x] Filtro/pestañas de reseñas por rol
- [x] Seed creíble (varias ciudades, reseñas divergentes por rol)

### P1 — Cierre beta (local, luego cloud)

- [x] API `GET /api/agencies/match` (nombre + ciudad, fuzzy)
- [x] `AgencyNameAlias` + UI “También se llamaba…”
- [x] Extensión MVP: Idealista → panel Fachada en ficha de anuncio
- [x] `/agencia/[slug]/panel`
- [x] Reseñas públicas solo moderadas
- [x] SEO básico por ciudad + LSSI / privacidad
- [x] Twilio listo por env (mock sin credenciales); **Supabase cloud** al activar beta (ver infra)

### P2+ (después de beta)

- Mapas, países fuera de ES, API mercantil, widget agencias, partnerships portales

## Beta e infra: ¿Supabase Pro?

**Contexto:** Meant To B2C y Migajas ocupan los 2 slots free. Una beta con usuarios reales **necesita persistencia** (reseñas, sesiones, claims).

| Opción | Veredicto |
|--------|-----------|
| Beta en Vercel solo memoria | ❌ Inaceptable — datos se pierden |
| Pausar Migajas o Meant To | ❌ Tienen usuarios reales |
| **Supabase Pro (~$25/mes)** | ✅ **Sí, activar en la semana del lanzamiento beta** (o 1–2 semanas antes para staging) |
| Pro ahora, sin beta | Opcional — puedes seguir en local hasta terminar P0+P1 |

**Honesto:** Pro no es “premium de lujo”; es el **coste mínimo de infra** para un cuarto producto en cloud junto a dos prod en free. El compute extra al inicio será bajo. No necesitas otro SaaS solo por Fachada beta si ya valoras Pro por SiQuiero/B2B en el horizonte.

**Orden sugerido:**

1. Terminar **P0+P1 en local** (sin pagar aún).
2. Crear proyecto Supabase `fachada`, migraciones, staging en Vercel.
3. **Activar Pro** cuando staging esté estable (1 semana antes de invitar betas).
4. Beta cerrada (lista pequeña, moderación activa).

## Fuera de alcance pre-beta

- Mapas, internacional, scraping portales, app nativa

## Relación con Meant To B2B

Producto y Supabase separados de B2C. No afecta el timing de Fachada beta.
