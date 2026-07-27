# Infraestructura y deploy

## Modos de almacenamiento

| Modo | Activación | Persistencia | Uso recomendado |
|------|------------|--------------|-----------------|
| **Memoria** | Sin `SUPABASE_SERVICE_ROLE_KEY` | Solo proceso actual | Dev diario, TDD |
| **Supabase local** | `supabase start` + `.env.local` | Docker local | Probar migraciones, RLS |
| **Supabase cloud** | Keys del dashboard en Vercel/local | Persistente | **Go-live** (pendiente slot) |

## Variables de entorno

Ver `.env.local.example`. Resumen:

| Variable | Obligatoria | Descripción |
|----------|-------------|-------------|
| `SUPABASE_SERVICE_ROLE_KEY` | No (memoria si falta) | Activa `SupabaseRepository` |
| `NEXT_PUBLIC_SUPABASE_URL` | Con Supabase | URL del proyecto |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Con Supabase | Cliente público (futuro) |
| `ADMIN_PASSWORD` | Recomendada en deploy | Panel `/admin` |
| `EXPOSE_DEV_SMS_CODE` | Solo demo Vercel | `true` → muestra OTP en API/UI |

**Nunca** commitear `.env.local` (está en `.gitignore`).

## Desarrollo local

```bash
npm install
npm run dev        # http://localhost:3000
npm test
npm run build
```

Sin `.env` → memoria + 3 agencias seed (Madrid x2, Barcelona x1).

### Supabase local (opcional)

```bash
npx supabase start
# Copiar URL y keys a .env.local
npx supabase db reset   # aplica supabase/migrations/
```

Requiere Docker.

## Deploy Vercel

| Campo | Valor |
|-------|-------|
| Proyecto | `joseahyeon-gmailcoms-projects/fachada` |
| URL alias | https://fachada-tau.vercel.app |
| Repo | `ConfineH/fachada` (auto-deploy en push a `main`) |

### Configuración actual (demo)

```
EXPOSE_DEV_SMS_CODE=true
ADMIN_PASSWORD=<configurado en dashboard Vercel>
# Sin SUPABASE_* → modo memoria
```

### Limitaciones demo (importante)

En Vercel serverless **sin Supabase**:

- Cada instancia tiene su propia memoria
- Cold starts resetean datos
- Una reseña creada puede no verse en la siguiente petición
- **No usar para usuarios reales ni captación de contenido**

Esto es distinto de Meant To y Migajas, que siempre despliegan **con** Supabase cloud en producción.

### Cuando haya slot Supabase

1. Crear o reactivar proyecto Supabase `fachada`
2. Aplicar migraciones: `supabase db push` o dashboard
3. Añadir en Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Redeploy
5. Quitar o dejar `EXPOSE_DEV_SMS_CODE` según entorno
6. Configurar Twilio y quitar exposición de códigos en prod

## Caché y limpieza

Tras problemas de build o para liberar espacio:

```bash
# Eliminar build cache Next.js
rm -rf .next

# Limpiar cache npm (global)
npm cache clean --force
```

Regenerar dependencias solo si hace falta: `rm -rf node_modules && npm install`

## Costes estimados (fase actual)

| Concepto | Coste |
|----------|-------|
| Supabase cloud | $0 (no usado) |
| Vercel | $0 (hobby) |
| Twilio SMS | $0 (mock) |
| Dominio custom | No configurado |

**Go-live estimado:** Supabase Pro $25/mes si no hay slot libre + SMS usage + dominio ~€10-15/año.

## Checklist deploy demo (estado actual)

- [x] Repo en GitHub
- [x] Vercel conectado
- [x] `EXPOSE_DEV_SMS_CODE` en preview/prod
- [x] `ADMIN_PASSWORD` configurado
- [ ] Supabase cloud — pendiente slot
- [ ] Twilio — pendiente go-live
- [ ] Dominio `fachada.app` — pendiente

## Checklist go-live (futuro)

Ver [Roadmap — Criterios de go-live](./roadmap.md#criterios-de-go-live).
