# Guía de desarrollo

## Arranque en 5 minutos

```bash
git clone https://github.com/ConfineH/fachada.git
cd fachada
npm install
npm run dev
```

Abre http://localhost:3000 — **no necesitas `.env`**.

## Comandos habituales

| Comando | Uso |
|---------|-----|
| `npm run dev` | Servidor desarrollo |
| `npm test` | Suite Vitest |
| `npm run test:watch` | TDD interactivo |
| `npm run build` | Build producción |
| `npm run lint` | ESLint |

## Flujo TDD (obligatorio en este repo)

`openspec/config.yaml` tiene `strict_tdd: true`.

1. **RED** — escribir test en `test/unit/` o `test/integration/`
2. **GREEN** — implementar en `src/lib/services/` o API
3. **REFACTOR** — sin cambiar comportamiento
4. Verificar: `npm test && npm run build`

Los tests viven en `test/`, no junto al código fuente.

## Probar flujos manualmente

### 0. Añadir inmobiliaria que no está en el listado
1. Nav → **Añadir inmobiliaria** o http://localhost:3000/agregar-inmobiliaria
2. Verificar tu móvil → datos de la oficina (nombre, ciudad, dirección, teléfono de la agencia **o** marcar *No hay teléfono publicado en internet*)
3. `/admin` → sección **Nuevas inmobiliarias sugeridas** → **Publicar**
4. Buscar la agencia en home y escribir reseña

### 1. Escribir reseña
1. Home → Inmobiliaria Sol
2. Panel "Escribir reseña" → teléfono `+34600111222`
3. Código aparece en pantalla (modo dev)
4. Completar reseña → recargar página

### 2. Reclamar perfil
1. Misma ficha → "Reclamar perfil" con otro teléfono (`+34600333444`)
2. `/admin` → password (local: `fachada-admin-dev`)
3. Aprobar reclamación

### 3. Responder como agencia
1. Volver a la ficha (agencia ahora "Verificada")
2. Panel verde "Gestión de reseñas"
3. Verificar con el **mismo teléfono del claim**
4. Responder reseña → recargar

## Estructura mental del código

```
¿Dónde va la lógica nueva?
  → src/lib/services/     (reglas de negocio + tests)
  → src/lib/repositories/ (solo acceso a datos)
  → src/app/api/          (HTTP fino, delega a services)
  → src/components/       (UI cliente)
  → src/app/**/page.tsx   (RSC, fetch vía services)
```

No llamar al repositorio desde páginas o componentes — siempre vía service o API.

## Añadir una feature nueva (checklist)

- [ ] ¿Hay spec en `openspec/specs/` o hace falta change nuevo?
- [ ] Test RED primero
- [ ] ¿Afecta a Repository? → actualizar interface + memory + supabase
- [ ] ¿Nueva ruta API? → seguir patrón de `src/app/api/*/route.ts`
- [ ] `npm test` + `npm run build`
- [ ] Si es decisión relevante → ADR en `docs/decisiones.md`

## Trabajar con Supabase (opcional)

Solo cuando necesites persistencia o probar SQL:

```bash
cp .env.local.example .env.local
npx supabase start
# Pegar keys en .env.local
npx supabase db reset
npm run dev
```

El banner superior dirá "Datos en Supabase" en lugar de "memoria".

## Para agentes / IA retomando el proyecto

Leer en este orden:

1. [docs/estrategia.md](./estrategia.md)
2. [docs/portfolio.md](./portfolio.md) — no pausar Migajas/Meant To
3. [docs/arquitectura.md](./arquitectura.md)
4. [docs/infraestructura.md](./infraestructura.md) — live: Supabase + Google
5. [docs/decisiones.md](./decisiones.md)

**No asumir** que Preview tiene las mismas env que Production. **No** activar Twilio ni Resend sin decidirlo.

## Convenciones

| Tema | Convención |
|------|------------|
| UI copy | Español |
| Código, specs, commits | Inglés |
| Commits | `feat:`, `fix:`, `chore:` (estilo existente) |
| IDs | UUID v4 |
| Teléfonos | `+34` + 9 dígitos móvil |

## Problemas frecuentes

| Síntoma | Solución |
|---------|----------|
| Build falla tras git pull | `rm -rf .next && npm run build` |
| No veo código SMS | En local, sin Twilio, el mock muestra el código. En Vercel Production no se expone |
| Reseña no aparece en Vercel | Si no hay `SUPABASE_SERVICE_ROLE_KEY`, el deploy está en memoria y se pierde. Si hay Supabase: falta moderación en `/admin` |
| Google no sale / error 403 | Client ID del proyecto GCP Fachada, origen `https://fachada-tau.vercel.app`, app OAuth en producción |
| "No autorizado" al responder | Mismo teléfono que hizo el claim aprobado |
| Hydration warning en dev | Conocido con DevBanner; no bloquea en local |

## Enlaces

- Demo: https://fachada-tau.vercel.app
- Specs: `openspec/specs/`
- ADRs: `docs/decisiones.md`
