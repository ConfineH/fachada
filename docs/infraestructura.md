# Infraestructura y deploy

## Modos de almacenamiento

| Modo | Activación | Persistencia | Uso recomendado |
|------|------------|--------------|-----------------|
| **Memoria** | Sin `SUPABASE_SERVICE_ROLE_KEY` | Solo proceso actual | Dev diario, TDD |
| **Supabase local** | `supabase start` + `.env.local` | Docker local | Probar migraciones, RLS |
| **Supabase cloud** | Keys del dashboard en Vercel/local | Persistente | **Producción** |

Proyecto cloud: `embmicoogxrxsvchywis` (`https://embmicoogxrxsvchywis.supabase.co`).

## Variables de entorno

Ver `.env.local.example`. Resumen:

| Variable | Obligatoria en Vercel | Descripción |
|----------|------------------------|-------------|
| `SUPABASE_SERVICE_ROLE_KEY` | Sí (Production y Preview) | Activa `SupabaseRepository` |
| `NEXT_PUBLIC_SUPABASE_URL` | Sí | URL del proyecto |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Sí | Sign-In (OAuth web, proyecto GCP **Fachada**). Tipo Config, no Secret. No subir el client secret. |
| `ADMIN_PASSWORD` | Sí | Panel `/admin` |
| `NEXT_PUBLIC_SITE_URL` | No | Override de la URL pública. Si no está, Production usa el dominio de Vercel (`fachada-tau.vercel.app` hoy) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | No | Cliente público (futuro); las tablas tienen RLS revoke |
| `RESEND_API_KEY` + `EMAIL_FROM` | No | Códigos al email en Vercel. Sin esto, login = solo Google |
| `TWILIO_*` | No | SMS de línea de negocio al reclamar ficha. No activar aún |
| `EXPOSE_DEV_SMS_CODE` | No | **No usar.** El código ya no la lee: en `NODE_ENV=production` no se exponen OTP |

**Nunca** commitear `.env.local` (está en `.gitignore`).

Preview debe llevar las mismas keys de Supabase y Google que Production. Si Preview no tiene service_role, el preview cae a memoria y parece “roto”.

## Auth en producción

- Google Identity Services (ID token). Client ID del proyecto GCP `Fachada` (no el de Migajas).
- Consentimiento: usuarios **externos**, app **en producción**.
- Orígenes JS: `https://fachada-tau.vercel.app` y `http://localhost:3000`.
- OAuth es gratis; el trial de Google Cloud es facturación del proyecto, no un cobro por login. Hay que tener facturación activa para que no suspendan el proyecto.
- Moderación de reseñas: manual en `/admin`.

## Desarrollo local

```bash
npm install
npm run dev        # http://localhost:3000
npm test
npm run build
```

Sin `.env` → memoria + agencias seed. Con Supabase en `.env.local` → misma base que cloud.

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

Tras cambiar env: Redeploy.

## Caché y limpieza

```bash
rm -rf .next
npm cache clean --force
```

## Costes (fase actual)

| Concepto | Coste |
|----------|-------|
| Supabase cloud | $0 (free tier) |
| Vercel | $0 (hobby) |
| Google Sign-In | $0 |
| Twilio SMS | $0 (no configurado) |
| Dominio custom | No configurado |

## Checklist live (estado)

- [x] Repo en GitHub + Vercel
- [x] Supabase cloud + migraciones
- [x] Google OAuth (proyecto GCP Fachada, app publicada, login con Gmail ajeno)
- [x] `ADMIN_PASSWORD` y moderación en `/admin`
- [ ] Preview con las mismas env que Production (Google + Supabase)
- [ ] Quitar `EXPOSE_DEV_SMS_CODE` si sigue en el dashboard
- [ ] Dominio `fachada.app` y buzón `privacidad@fachada.app`
- [ ] Twilio — cuando haga falta SMS de ficha
- [ ] Extensión Idealista contra la URL live (no Chrome Store aún)
