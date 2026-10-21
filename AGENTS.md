<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Revisiones de código

Cuando revises código o un PR, marca como bloqueante solo lo que:

- rompa producción o el build,
- pierda o corrompa datos,
- sea un fallo de seguridad o exponga datos personales,
- cobre mal o rompa los pagos,
- dé a los usuarios información legal o cifras incorrectas.

Si no encuentras nada de eso, di «Sin bloqueantes» y no busques más. Está bien no reportar nada.

Lo demás (estilo, nombres, refactors, mejoras opcionales) va en una lista aparte de «opcional», con un máximo de 3 puntos, y nunca bloquea el merge.
