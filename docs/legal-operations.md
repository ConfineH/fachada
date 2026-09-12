# Operación legal y privacidad

Documento interno. No sustituye el dictamen pendiente en
[`legal-review-brief.md`](./legal-review-brief.md).

**12 sep 2026:** el producto ya tiene denuncia DSA, motivos de moderación,
apelación, exportación de cuenta y purga de evidencia vencida. Este
documento sigue siendo el ROPA/LIA operativo; no está firmado por abogado.

## Responsables

- Responsable del tratamiento y prestador: el titular publicado en el aviso
  legal.
- Punto de contacto de usuarios, autoridades y avisos DSA:
  `LEGAL_CONTACT_EMAIL`.
- Privacidad: `LEGAL_PRIVACY_EMAIL` o, si no existe, el mismo buzón.
- Moderación: una persona identificada en el registro interno; nunca una
  decisión automática final para contenido denunciado.

## Registro de actividades (ROPA)

### Cuentas y autenticación

- Datos: email, teléfono si se usa, identificador, sesiones, OTP y actividad.
- Finalidad: crear cuenta, autenticar y prevenir abuso.
- Base: ejecución del servicio; interés legítimo para seguridad y abuso.
- Destinatarios: Vercel, Supabase, Google si se elige, Resend si se usa email.
- Conservación: OTP hasta caducidad y limpieza técnica; sesiones hasta
  caducidad; cuenta hasta supresión o bloqueo justificado.

### Reseñas y votos

- Datos: autor interno, rol, fecha/tipo de experiencia, texto, rating,
  declaración, nivel de acreditación y votos.
- Finalidad: publicar experiencias y mantener integridad del archivo.
- Base: ejecución del servicio solicitado; interés legítimo y libertades de
  expresión e información para publicación y moderación.
- Conservación: mientras se publique; después, bloqueo limitado para defensa de
  reclamaciones. Revisar este plazo con abogado.

### Evidencias de experiencia y reclamación

- Datos: documentos o capturas que pueden contener identidad y relación
  contractual.
- Finalidad: acreditar experiencia o representación y resolver controversias.
- Base: interés legítimo y, cuando proceda, obligación legal.
- Conservación: solo hasta resolver la moderación o reclamación más un periodo
  de defensa validado por abogado. Nunca se publican.

### Avisos DSA y rectificaciones

- Datos: denunciante, contacto, relación, fundamento, evidencia, contenido
  denunciado, decisión y comunicaciones.
- Finalidad: tramitar avisos, motivar decisiones y defender el expediente.
- Base: obligación legal e interés legítimo.
- Conservación: expediente bloqueado durante el plazo legal de defensa que
  confirme el dictamen.

### Claims y aportes a fichas

- Datos: representante, contacto, CIF, cargo, documentación y aportes.
- Finalidad: verificar representación y corregir la ficha.
- Base: ejecución de medidas solicitadas e interés legítimo.
- Conservación: documentos hasta resolución y periodo de defensa; datos mínimos
  del claim mientras exista representación.

## Ponderación de interés legítimo (LIA)

Intereses: permitir decisiones informadas sobre gestión inmobiliaria, evitar
fraude, conservar evidencia y proteger el debate de consumo.

Necesidad: el email privado, la asociación autor-reseña y un expediente mínimo
son necesarios para limitar abuso y responder a reclamaciones. No lo son el
nombre civil público, documentos completos, datos de terceros ni fingerprinting
masivo.

Balance y garantías:

- pseudónimo por defecto;
- etiquetas que distinguen email, experiencia declarada y acreditada;
- prohibición de datos personales innecesarios;
- revisión humana y derecho de respuesta;
- denuncia accesible, decisión motivada y revisión;
- evidencia privada, acceso restringido y borrado programado;
- oposición y supresión evaluadas caso por caso;
- ficha y resumen separados visualmente de la voz del usuario.

Revisar el LIA cuando cambie la finalidad, se automatice scoring o la ficha
identifique principalmente a un autónomo.

## Screening EIPD

Hoy no se concluye automáticamente que sea obligatoria, pero se reevalúa si
concurren dos o más señales: perfilado sistemático, gran escala, datos
sensibles, personas vulnerables, combinación de fuentes, observación
sistemática o decisiones automatizadas con efecto significativo.

Triggers internos: más de 1.000 usuarios activos mensuales, antifraude
automatizado, scoring de personas físicas/autónomos, nuevas fuentes externas o
tratamiento habitual de evidencias sensibles.

## Conservación y limpieza

- OTP: borrar tras verificación o caducidad.
- Sesión: borrar al caducar o cerrar sesión.
- Evidencia rechazada: borrar tras cerrar el expediente y vencer el plazo
  validado.
- Logs: minimizar query strings y conservar solo el periodo técnico necesario.
- Backups: documentar ciclo de sobreescritura y restauración.
- Legal hold: suspende el borrado solo para el expediente concreto y se
  documenta.

## Derechos RGPD

El buzón acusa recibo. La identidad se verifica de forma proporcionada. Se
responde dentro de un mes, salvo ampliación legal motivada.

- Acceso/exportación: cuenta, reseñas, votos, guardados y claims propios.
- Rectificación: datos de cuenta y hechos propios.
- Supresión: cuenta y datos no necesarios; la publicación se pondera de forma
  individual, sin prometer conservación automática.
- Oposición/limitación: ocultación mientras se resuelve cuando proceda.
- Portabilidad: datos facilitados por el usuario en formato estructurado.

## Brechas

1. Contener y conservar evidencia técnica.
2. Registrar fecha, sistemas, categorías, afectados, impacto y medidas.
3. Evaluar riesgo para derechos y libertades.
4. Notificar a AEPD antes de 72 horas cuando exista riesgo.
5. Comunicar a afectados sin dilación cuando el riesgo sea alto.
6. Rotar secretos, revocar sesiones y documentar cierre.

## Encargados y transferencias

Mantener copia vigente de DPA, subencargados, región y mecanismo de
transferencia de Vercel, Supabase y Resend; para Google, documentar su rol en el
login. No afirmar región UE o DPF/SCC sin verificar la configuración y el
contrato reales.

## Gate de sociedad y seguro

- Iniciar SL al llegar a 10 reseñas públicas.
- SL operativa antes de 20 reseñas, testers externos, monetización, contratación
  o inversión; lo que suceda primero.
- Adelantar ante burofax, acusación penal publicada o campaña de captación.
- Constituir con 3.000 euros y caja adicional.
- Transferir por escrito IP, dominio, marca, base, proveedores, contratos y
  responsabilidad de tratamiento.
- Contratar `media liability` que cubra UGC, honor, privacidad y propiedad
  intelectual; cyber para respuesta a incidentes. Comprobar retroactividad,
  franquicia, defensa dentro/fuera del límite y exclusiones.
