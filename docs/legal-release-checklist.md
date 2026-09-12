# Gate legal antes de crecer

Debe quedar firmado y fechado. Mientras falte un bloque obligatorio no se
captan reseñas mediante campañas ni se distribuye la extensión.

**Estado del código (12 sep 2026):** las casillas de Producto ya tienen
implementación en la app (formularios, APIs, admin, etiquetas). Siguen
pendientes: aplicar `012_legal_hardening.sql` en el Supabase live, rellenar
`LEGAL_*` en Vercel, y **probar** cada flujo en producción. Seguridad
(RLS/DPA) y dictamen siguen siendo trabajo humano.

## Producto

- Crear reseña con experiencia de hoy y todas las declaraciones.
- Rechazar fecha futura, fecha de más de 30 días y términos antiguos.
- Confirmar que el email/teléfono no aparece en HTML, API pública ni metadatos.
- Comprobar etiqueta «experiencia declarada» sin evidencia.
- Adjuntar evidencia, comprobar bucket privado y URL firmada temporal.
- Aprobar con y sin acreditación y verificar la etiqueta pública resultante.
- Denunciar desde la reseña, recibir referencia y acuse por email.
- Mantener, retirar y pedir información con regla y motivación no vacías.
- Confirmar ocultación inmediata de contenido retirado.
- Confirmar comunicación al denunciante y autor.
- Solicitar revisión desde la cuenta y resolverla por otra revisión humana.
- Exportar datos de cuenta y tramitar una solicitud RGPD de prueba.
- Ejecutar borrado de evidencia vencida y comprobar fichero y columnas.

## Seguridad y privacidad

- Revisar RLS/revocaciones de `content_notices` y buckets privados.
- Probar que anon/authenticated no leen evidencia ni expedientes con la API de
  Supabase.
- Rotar y almacenar solo en Vercel los secretos de servicio.
- Verificar logs sin cuerpos de reseñas, emails, tokens ni URLs de evidencia.
- Guardar DPAs, regiones, subencargados y transferencias vigentes.
- Simular una brecha y registrar decisión sobre AEPD/afectados.
- Documentar backup y plazo real de purga, incluido legal hold.

## Dictamen y corporativo

- Abogado responde y firma las preguntas de
  [`legal-review-brief.md`](./legal-review-brief.md).
- Incorporar su redacción final sin llamar «verificada» a una experiencia solo
  declarada.
- Confirmar tratamiento del límite de 30 días del artículo 20.4 TRLGDCU.
- Confirmar encaje DSA, LSSI, rectificación, honor y bases RGPD.
- Completar [`sl-migration-checklist.md`](./sl-migration-checklist.md) al llegar
  al primer trigger.
- Póliza media/cyber vigente antes de campañas o escala.
- Autorización escrita de Idealista o retirada/rediseño de la extensión antes
  de distribuirla.

## Evidencia de cierre

Adjuntar al expediente: salida de tests/build, capturas de los flujos, SQL
aplicado, políticas publicadas, emails de prueba, DPAs, dictamen, escritura/NIF
si aplica, póliza y autorización o decisión de no distribuir la extensión.
