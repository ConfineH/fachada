# Estrategia y estado

## Respuesta en una línea

**Fachada ya tiene proyecto Supabase cloud propio y se opera como producto persistente; el código público sigue funcionando en memoria si faltan las env vars.**

## Situación actual (septiembre 2026)

| Dimensión | Estado |
|-----------|--------|
| Código MVP | ✅ Búsqueda, reseñas, claims, respuestas, admin, tags de incidencia |
| Tests | ✅ Vitest + build |
| Deploy Vercel | ⚠️ https://fachada-tau.vercel.app — persistencia solo si Vercel tiene `SUPABASE_SERVICE_ROLE_KEY` |
| Supabase cloud | ✅ Proyecto `fachada` (`embmicoogxrxsvchywis`) ACTIVE |
| Datos | Seed inicial de agencias/reseñas en cloud; no hay usuarios reales aún |
| SMS real (Twilio) | ❌ Mock si no hay credenciales |

## Cómo conectar el server

En `.env.local` y en Vercel:

- `NEXT_PUBLIC_SUPABASE_URL=https://embmicoogxrxsvchywis.supabase.co`
- `SUPABASE_SERVICE_ROLE_KEY=` (Dashboard → API; **no** la anon key; **no** commit)

Las tablas tienen RLS revoke: el Next server habla con **service_role**. Auth de usuarios sigue siendo OTP SMS propio, no Supabase Auth.

Sin esas variables, `MemoryStore` (útil para tests).

## Dirección

1. Cablear env en local y Vercel.
2. Twilio cuando haya tráfico real.
3. Densidad en ciudad piloto + extensión Idealista.
4. Premium agencia **después** de densidad.

No mezclar datos con Meant To ni Migajas. No pausar esos proyectos para “liberar slot”: Fachada ya tiene el suyo.
