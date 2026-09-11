# Semana 1 — ops (tú + repo)

El código ya no es el bloqueo. Esta lista sí.

## 1. Rotar `ADMIN_PASSWORD`

1. Vercel → Fachada → Settings → Environment Variables.
2. `ADMIN_PASSWORD` = una frase larga (Production **y** Preview).
3. No uses `fachada-admin-dev`. En producción el login responde 503 si sigue el default.
4. Redeploy. Entra en `/admin` y comprueba que la nueva clave funciona.

Local: mismo valor en `.env.local`.

## 2. Titular LSSI (sin constituir SL)

Vercel (Production + Preview), variables **no** `NEXT_PUBLIC_`:

| Variable | Ejemplo |
|----------|---------|
| `LEGAL_HOLDER_NAME` | tu nombre y apellidos |
| `LEGAL_HOLDER_ID` | tu NIF |
| `LEGAL_HOLDER_ADDRESS` | domicilio a efectos de notificaciones |
| `LEGAL_CONTACT_EMAIL` | un correo que leas |
| `LEGAL_PRIVACY_EMAIL` | el mismo, o uno dedicado |

Redeploy. Abre `/legal/aviso-legal`: debe desaparecer el aviso ámbar.

## 3. 25 fichas Madrid

El catálogo está en `data/madrid-pilot-agencies.json` (marcas reales, sin teléfonos inventados, sin reseñas fake). Direcciones genéricas salvo donpiso / Alfa / Redpiso.

**Aplicar en Supabase (SQL editor del proyecto `embmicoogxrxsvchywis`):**

1. `npm run seed:madrid-sql` regenera `supabase/seed/madrid-pilot.sql` si cambias el JSON.
2. Pega y ejecuta ese SQL. Es idempotente por `slug`.

Luego `/explorar` o `/ciudades/madrid` debería listar las 25 fichas reales (más Alamo Foro si sigue). Las fichas demo por ciudad (Sol, Gestión Urbana, Pisos Barcelona, etc.) se borran al aplicar `supabase/seed/city-pilot.sql`.

Oficinas de barrio que salgan en Idealista y no matcheen: `/admin` → alta rápida o «añadir alias».

Otras ciudades: `data/city-pilot-agencies.json` (10 marcas conocidas en Barcelona, Valencia, Málaga y Sevilla). `npm run seed:cities-sql` regenera `supabase/seed/city-pilot.sql`.

## 4. Extensión unpacked (10 anuncios)

1. Chrome → `chrome://extensions` → Cargar descomprimida → `extension/idealista`.
2. Abre 10 anuncios de **alquiler en Madrid** de marcas del catálogo.
3. En `/admin`, pega el nombre del anuncio en **Probar match**.
4. Log:

| # | URL anuncio | Nombre en Idealista | ¿Match? | Confianza | Alias que faltaba |
|---|----------------|---------------------|---------|-----------|-------------------|

Objetivo de la semana: ≥ 7/10. Cada fallo → un alias, no una feature.

## No hacer esta semana

Twilio, Chrome Web Store, Stripe, anuncios, reseñas inventadas, SEO nacional.
