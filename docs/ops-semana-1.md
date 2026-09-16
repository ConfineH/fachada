# Semana 1 — ops (tú + repo)

El código ya no es el bloqueo. Esta lista sí.

**16 sep 2026:** el aviso público solo pide un correo (`LEGAL_CONTACT_EMAIL`)
cuando exista el dominio. Nombre/NIF/domicilio van al constituir la SL.
`012_legal_hardening.sql` y el seed de Madrid (25 fichas + alias) ya están
en el proyecto live. No hace falta volver a pegarlos salvo que cambies el JSON.

## 1. Rotar `ADMIN_PASSWORD`

1. Vercel → Fachada → Settings → Environment Variables.
2. `ADMIN_PASSWORD` = una frase larga (Production **y** Preview).
3. No uses `fachada-admin-dev`. En producción el login responde 503 si sigue el default.
4. Redeploy. Entra en `/admin` y comprueba que la nueva clave funciona.

Local: mismo valor en `.env.local`.

## 2. Correo de contacto (ahora)

En Vercel (Production + Preview), **solo**:

| Variable | Valor |
|----------|---------|
| `LEGAL_CONTACT_EMAIL` | un correo que leas |

Opcional: `LEGAL_PRIVACY_EMAIL` si quieres un buzón aparte. Si no, se usa el mismo.

Redeploy. Abre `/legal/aviso-legal`: debe desaparecer el aviso ámbar y verse el correo. **No** pongas nombre, NIF ni domicilio hasta constituir la SL.

`LEGAL_HOLDER_NAME` / `LEGAL_HOLDER_ID` / `LEGAL_HOLDER_ADDRESS` se rellenan entonces. Hasta ese momento el aviso no los publica.

## 3. 25 fichas Madrid

**Hecho (16 sep 2026):** las 25 fichas y alias están en el proyecto live.
`/ciudades/madrid` debe listarlas (más Alamo Foro si sigue).

El catálogo vive en `data/madrid-pilot-agencies.json`. Si lo cambias:
`npm run seed:madrid-sql` y vuelve a pegar `supabase/seed/madrid-pilot.sql`.

Oficinas de barrio que salgan en Idealista y no matcheen: `/admin` → alta rápida o «añadir alias».

Otras ciudades: `data/city-pilot-agencies.json`. `npm run seed:cities-sql` regenera `supabase/seed/city-pilot.sql`.

## 4. Extensión unpacked (10 anuncios)

Instrucciones para testers (aviso de Chrome, carpeta fija, qué no hace):
`/extension`. Resumen:

1. Deja `extension/idealista` en un sitio fijo. No la borres.
2. Chrome → `chrome://extensions` → Modo de desarrollador (arriba a la derecha).
3. Cargar descomprimida → esa carpeta.
4. Abre 10 anuncios de **alquiler en Madrid** de marcas del catálogo.

En `/admin`, pega el nombre del anuncio en **Probar match**. Log:

| # | URL anuncio | Nombre en Idealista | ¿Match? | Confianza | Alias que faltaba |
|---|----------------|---------------------|---------|-----------|-------------------|

Objetivo de la semana: ≥ 7/10. Cada fallo → un alias, no una feature.

## No hacer esta semana

Twilio, Chrome Web Store, Stripe, anuncios, reseñas inventadas, SEO nacional.
