# Estrategia y estado

## Respuesta en una línea

**Fachada se desarrolla y valida en local; no tiene slot Supabase cloud ni producción live con datos persistentes hasta que el portfolio lo permita.**

## Situación actual (julio 2026)

| Dimensión | Estado |
|-----------|--------|
| Código MVP | ✅ Completo (búsqueda, reseñas, claims, respuestas, admin) |
| Tests | ✅ 17 tests unitarios, build OK |
| Deploy Vercel | ⚠️ Demo en https://fachada-tau.vercel.app — datos efímeros (memoria serverless) |
| Supabase cloud | ❌ Sin slot asignado |
| Usuarios reales | ❌ Ninguno — fase de producto, no de tracción |
| SMS real (Twilio) | ❌ Mock en dev/preview |

## Por qué no está live

El plan gratuito de Supabase permite **2 proyectos activos** en cloud. Están reservados para productos con usuarios reales:

| Slot | Proyecto | Motivo |
|------|----------|--------|
| 1 | **Meant To B2C** | Producción, usuarios reales |
| 2 | **Migajas** | En uso activo |

Fachada compite con SiQuiero, Meant To B2B y futuros MVPs por un tercer slot que **no existe** en free tier. La decisión consciente es **no pausar** Meant To ni Migajas para dar sitio a Fachada.

## Dirección elegida: local-first + demo efímera

En lugar de forzar cloud, Fachada adopta el mismo patrón que usamos para MVPs en exploración:

```
Desarrollo diario     →  memoria local (sin .env)
Validación técnica    →  tests + build + flujos manuales en localhost
Demo compartible      →  Vercel sin Supabase (limitaciones aceptadas)
Producción real       →  cuando haya slot o Supabase Pro ($25/mes)
```

Esto es coherente con cómo Migajas y Meant To **empezaron** (desarrollo local, schema listo) antes de merecer un slot cloud. La diferencia: aquellos ya pasaron a producción; Fachada está **antes** de ese umbral.

## Qué sí podemos hacer ahora

- Desarrollar features nuevas en local con TDD
- Probar flujos completos (reseña → claim → admin → respuesta de agencia)
- Mostrar UI en Vercel como demo visual (sin prometer persistencia)
- Mantener migraciones SQL listas (`supabase/migrations/`) para el día del go-live

## Qué no hacemos (por ahora)

- No pedir reseñas a usuarios reales en URL pública
- No invertir en SEO, dominio custom ni marketing
- No configurar Twilio de pago
- No pausar otros proyectos para liberar slot
- No mezclar datos de Fachada en el proyecto Supabase de otro producto

## Criterios para pasar a producción live

Ver checklist detallado en [Roadmap](./roadmap.md#criterios-de-go-live). Resumen:

1. Slot Supabase disponible **o** Supabase Pro contratado
2. Twilio (o proveedor SMS) configurado
3. Dominio y variables de producción definidas
4. Moderación y legal (LSSI, privacidad) revisados
5. Al menos un flujo validado con datos persistentes en staging cloud

## Relación con la visión de producto

La visión completa (reseñas verificadas, perfiles de agencia, monetización) sigue en `docs/docs-extracted.txt`. Esta estrategia **no cambia el producto** — solo define **en qué fase de infraestructura** estamos y evita decisiones improvisadas bajo presión de “tener algo live”.
