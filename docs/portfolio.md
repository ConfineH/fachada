# Portfolio y slots Supabase

Documento de referencia para mantener coherencia entre proyectos. Misma lógica que aplicamos a Meant To y Migajas, extendida al resto del portfolio.

## Mapa del portfolio (julio 2026)

| Proyecto | Fase | Supabase cloud | Deploy | Usuarios reales |
|----------|------|----------------|--------|-----------------|
| **Meant To B2C** | Producción | Slot 1 (fijo) | Live | Sí |
| **Migajas** | Producción | Slot 2 (fijo) | Live | Sí |
| **SiQuiero** | Beta cerrada | Sin slot — túnel local o Pro | Preview | 1 tester |
| **Fachada** | MVP / exploración | Sin slot | Demo Vercel (efímera) | No |
| **Meant To B2B** | Por empezar | Sin slot — local al inicio | — | No |
| **Futuros MVPs** | Idea | Local / memoria | — | No |

## Reglas del portfolio (acordadas)

### 1. Los slots son para tracción, no para cantidad de repos

Un proyecto merece slot cloud cuando tiene **usuarios reales activos** o está a días de lanzamiento con datos persistentes obligatorios. Tener código en GitHub no es suficiente.

### 2. Patrón estándar para MVPs nuevos

Copiar de Fachada (y de la fase inicial de Migajas / Meant To):

```
Repository interface
  ├── MemoryStore      → npm run dev sin config
  ├── Supabase local   → supabase start + migraciones
  └── Supabase cloud   → solo al go-live
```

### 3. Stack base compartido

| Capa | Elección común | Notas |
|------|----------------|-------|
| Frontend | Next.js App Router | SSR donde importe SEO (Fachada, Migajas) |
| Estilos | Tailwind CSS | — |
| Backend | API Routes + services | Sin microservicios en MVP |
| DB | PostgreSQL vía Supabase | Schema + RLS cuando toque cloud |
| Auth | Según producto | SMS (Fachada), email/OAuth (Migajas), etc. |
| Deploy | Vercel | Preview gratis; prod con DB real cuando aplique |
| Specs | OpenSpec en `openspec/` | SDD donde el repo lo use |
| Tests | Vitest en `test/` | TDD estricto en Fachada |

### 4. Rotación de slots (solo si es urgente)

Si un beta tester **necesita** cloud temporalmente (ej. SiQuiero):

- **Opción A:** Túnel local (`supabase start` + Cloudflare Tunnel) — sin coste
- **Opción B:** Supabase Pro — $25/mes, slots ilimitados
- **Opción C:** Rotar slot 2 — **no recomendado** si Migajas tiene usuarios activos

Fachada **no usa** rotación: no hay usuarios esperando.

### 5. Vercel sin Supabase ≠ producción

| Proyecto | Vercel + memoria | Vercel + Supabase |
|----------|------------------|-------------------|
| Meant To | Nunca en prod | ✅ Producción actual |
| Migajas | Nunca en prod | ✅ Producción actual |
| Fachada | ✅ Solo demo | Pendiente go-live |
| SiQuiero | Beta temporal | Objetivo al validar |

En serverless, la memoria **no persiste** entre instancias ni cold starts. Documentar siempre esta limitación en demos públicas.

## Dónde está cada cosa

| Proyecto | Repo / URL (referencia) |
|----------|-------------------------|
| Fachada | `ConfineH/fachada` · https://fachada-tau.vercel.app |
| Migajas | (prod) migajas.vercel.app |
| Meant To B2C | slot Supabase dedicado |

> Actualizar esta tabla cuando cambien URLs o repos.

## Cuándo replantear el portfolio

- Meant To B2B entra en beta con usuarios → evaluar Pro o pausar un MVP sin tracción
- Fachada valida tracción orgánica → solicitar slot o Pro
- Algún proyecto se archiva → liberar slot para el siguiente

## Coherencia para agentes y futuros chats

Al retomar Fachada (o cualquier MVP sin slot), recordar:

1. **No asumir** que hay Supabase cloud configurado
2. **No sugerir** pausar Migajas o Meant To sin preguntar
3. **Priorizar** `npm run dev` y tests antes que deploy
4. **Mencionar** limitaciones de demo Vercel si se habla de URL pública
