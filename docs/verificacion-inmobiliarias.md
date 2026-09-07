# Verificación de perfiles inmobiliaria (anti-suplantación)

Alineado con prácticas de **Google Business Profile** y **Glassdoor Employer Center**: varias señales independientes + revisión humana.

## Capas de verificación

| Capa | Qué demuestra | Implementación Fachada |
|------|----------------|------------------------|
| Móvil personal | Persona real detrás de la solicitud | SMS OTP (cuenta usuario) |
| Teléfono de la ficha | Acceso a la línea pública del negocio | OTP al `agency.phone` si `phonePublished` |
| Sin teléfono online | Agencias opacas | Checkbox al dar de alta; badge **Contacto no verificado**; reclamo solo documental |
| Email corporativo | Empleado/representante de la marca | Dominio = web o email de ficha; no Gmail/Outlook |
| Documentación | Vínculo legal con la sociedad | CIF, registro mercantil, poder, o prueba de dominio |
| Declaración | Responsabilidad penal/administrativa | Checkbox de attestation |
| Moderación | Juicio humano ante dudas | Admin aprueba/rechaza en `/admin` |

## Documentación aceptada (mínimo uno “fuerte”)

- **Identificación fiscal** (CIF/NIF)
- **Registro mercantil / nota simple**
- **Poder o acreditación de representación**
- **Prueba de control del dominio** (si el email no coincide con la ficha)
- Vídeo de fachada/local (refuerzo, no sustituye lo fuerte)

## Qué no pedimos

- Contratos de inquilinos (privacidad)
- DNI escaneado en claro en beta (valorar proveedor KYC más adelante)

## Direcciones en ficha

- **Oficina principal** (`address`): lo visible arriba.
- **Domicilio social** (`legalAddress`): bloque legal, opcional.

## Reseñas de usuarios

Solo **móvil** para publicar (no email como factor único).
