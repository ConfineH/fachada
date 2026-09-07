# Fachada — Brief de producto y diseño (Stitch)

Documento para diseño de interfaz. Resume **qué es**, **para quién**, **cómo funciona** y **qué sensación debe transmitir**. El producto es **web en español (España)**, mercado del alquiler y la gestión inmobiliaria.

---

## 1. Resumen ejecutivo

**Fachada** es un directorio público de **reseñas sobre cómo gestionan las inmobiliarias** en España — no sobre el piso en sí, sino sobre la **agencia** (comunicación, reparaciones, fianzas, trato a inquilinos y propietarios). En Idealista y Fotocasa ves el anuncio y el nombre de la inmobiliaria, pero **no hay opiniones fiables sobre su gestión**. Fachada cubre ese hueco.

La propuesta central es **confianza con matices**: dos valoraciones visibles (**inquilino** vs **propietario**), porque una media única suele mentir. Los usuarios leen y escriben reseñas tras **verificar el móvil**; las inmobiliarias pueden **reclamar su perfil** con controles anti-suplantación (estilo Google Business Profile / Glassdoor). El diseño debe sentirse **serio, claro y ciudadano** — más “información útil antes de firmar” que “startup llamativa” o “portal inmobiliario clónico”.

**Fase actual:** MVP funcional (local / demo). Prioridad de diseño: **pulir la experiencia pública** (explorar, ficha, escribir reseña, añadir agencia faltante) y **jerarquía visual de confianza** (verificado, contacto no verificado, reseñas moderadas).

---

## 2. Nombre, posicionamiento y una frase

| | |
|---|---|
| **Nombre** | Fachada |
| **Metáfora** | La “cara” pública de la inmobiliaria; lo que ves antes de confiar |
| **Tagline (trabajo)** | *Reseñas reales de inmobiliarias en España* |
| **No somos** | Un portal de pisos, un clon de Idealista, ni un foro anónimo sin moderación |

---

## 3. Problema y oportunidad

**Problema (usuario):**

- Alquilar o delegar un piso implica una inmobiliaria intermediaria cuya **reputación de gestión** es difícil de contrastar.
- Google Reviews mezcla todo (nombre antiguo, sucursales, reseñas del piso vs de la gestión).
- Portales de anuncios no permiten valorar **cómo gestionan** tras el contrato.

**Problema (mercado):**

- Agencias **opacas** (sin teléfono ni datos claros online) son justo las que más necesitan visibilidad ciudadana, pero también las más difíciles de verificar.

**Oportunidad:**

- Ser la capa de **reputación de gestión** enlazada al **nombre comercial** que el usuario ya ve en anuncios.
- Extensión de navegador (futuro cercano): badge en Idealista con enlace a Fachada.

---

## 4. Objetivo del producto

1. **Ayudar a decidir** con información separada por rol (inquilino / propietario).
2. **Recoger experiencias verificadas** (móvil) con moderación humana en beta.
3. **Dar voz legítima a inmobiliarias** que reclaman perfil (responder reseñas, panel).
4. **Evitar suplantaciones** en reclamaciones de perfil (documentación + reglas claras en UI).
5. **Permitir añadir inmobiliarias que faltan** (como “añadir sitio” en Google Maps), con revisión admin.

**Éxito (beta):** usuarios encuentran o crean una ficha, leen medias por rol, publican reseña; admins moderan; al menos un flujo de claim creíble sin fricción absurda.

---

## 5. Públicos y personas

### 5.1 Inquilino / propietario (lector)

- Busca piso o ya tiene relación con una agencia.
- Necesita saber: *¿responden?, ¿retrasan reparaciones?, ¿tratan distinto a propietarios e inquilinos?*
- Puede entrar sin cuenta; solo necesita móvil para **escribir**.

### 5.2 Inquilino / propietario (autor de reseña)

- Motivación: desahogo, advertir a otros, equilibrio tras mala/good experiencia.
- Debe elegir rol al escribir; la reseña cuenta en la media de ese rol.
- Espera que la reseña **no sea pública al instante** si hay moderación (copy honesto).

### 5.3 Representante de inmobiliaria

- Quiere responder, corregir percepción, proteger marca.
- Debe pasar verificación fuerte (teléfono de la ficha si existe; si no, solo vía documental).
- No es el usuario principal en beta, pero el diseño del **claim** y **panel** debe transmitir seriedad.

### 5.4 Administrador (interno)

- Cola: reseñas pendientes, reclamaciones de perfil, **nuevas inmobiliarias sugeridas**.
- UI funcional, no marketing; prioridad claridad y decisión rápida.

---

## 6. Propuesta de valor (mensajes clave para UI)

| Mensaje | Cómo debe verse |
|--------|------------------|
| Dos notas, no una | Dos bloques o tarjetas: **Inquilinos** / **Propietarios** con media y nº reseñas |
| Nombre comercial primero | Título de ficha = nombre de la agencia; legal/CIF secundario |
| Confianza gradual | Badges: *Verificada*, *Contacto no verificado*, *Reseñas revisadas* |
| Ciudad y exploración | Explorar por ciudad; no solo buscador vacío |
| Ciudadanía | “Añadir inmobiliaria” visible cuando no hay resultados |
| Honestidad | Sin estrellas falsas, sin reseñas sin moderar en público (beta) |

---

## 7. Cómo funciona — flujos principales

### 7.1 Descubrir y leer (sin login)

1. **Home:** buscar por nombre o ciudad; listado con **dos medias** por agencia.
2. **Explorar (`/explorar`):** ciudades con conteos; enlace a listado por ciudad.
3. **Ficha agencia (`/agencias/[slug]`):**
   - Oficina principal arriba; domicilio social aparte si existe.
   - Resumen inquilino / propietario.
   - Filtros de reseñas por rol.
   - Enlaces “Soy inquilino / Soy propietario” (énfasis, no apps distintas).
   - Alias “También conocida como…”.

### 7.2 Escribir reseña

1. En ficha → panel lateral “Escribir reseña”.
2. Verificar **móvil español** (SMS).
3. Elegir rol, nota 1–5, título y texto.
4. Mensaje: reseña enviada; **visible cuando moderación la apruebe** (beta).

### 7.3 Añadir inmobiliaria que no está

1. Nav o empty state → **Añadir inmobiliaria**.
2. Verificar móvil del solicitante.
3. Formulario: nombre, ciudad, CP, dirección oficina.
4. **Teléfono:** obligatorio salvo checkbox *“No hay teléfono publicado en internet”*.
5. Opcional: web, enlace Idealista/Fotocasa, nota a moderación.
6. Tras aprobar admin → aparece en buscador.

### 7.4 Reclamar perfil (inmobiliaria)

**Con teléfono en ficha:**

1. Móvil personal → OTP al **teléfono de la agencia** → datos + email corporativo + documentos → revisión admin.

**Sin teléfono público:**

1. Móvil personal → **sin OTP de negocio** → mismo formulario con **más exigencia documental** (copy explícito).

### 7.5 Panel inmobiliaria (post-claim)

- Ruta dedicada (`/agencia/[slug]/panel`): medias por rol, responder reseñas (una respuesta por reseña).

### 7.6 Admin

- Login simple; tres colas: **sugerencias de agencias**, **claims**, **reseñas**.

### 7.7 Extensión (contexto diseño futuro)

- Badge compacto en anuncio Idealista: “Inq. X · Prop. Y · N reseñas” + enlace. No diseñar en v1 web, pero la **ficha** debe ser el destino natural del clic.

---

## 8. Mapa de pantallas (inventario)

| Pantalla | Ruta | Objetivo UX |
|----------|------|-------------|
| Home / buscador | `/` | Encontrar agencia; CTA explorar y añadir |
| Explorar | `/explorar` | Orientación por ciudad |
| Ciudad | `/ciudades/[city]` | Listado local con dual rating |
| Ficha agencia | `/agencias/[slug]` | Confianza + reseñas + escribir + reclamar |
| Añadir inmobiliaria | `/agregar-inmobiliaria` | Flujo Maps-like, paso a paso |
| Panel agencia | `/agencia/[slug]/panel` | Gestión post-verificación |
| Legal | `/legal/*` | LSSI / privacidad sobrios |
| Admin | `/admin` | Moderación densa, utilitaria |

**Componentes transversales:** navegación global, banner dev (solo entornos demo), formularios de verificación SMS, tarjetas de rating dual, listas de reseñas con filtro por rol.

---

## 9. Confianza, estados y copy (crítico para diseño)

Diseñar **lenguaje visual consistente** para:

| Estado | Significado | UI sugerida |
|--------|-------------|-------------|
| Agencia verificada (claim aprobado) | Perfil reclamado por representante | Badge verde discreto |
| Contacto no verificado | Sin teléfono público conocido | Badge neutro / ámbar suave, no alarmista |
| Reseña moderada | Visible en ficha pública | Lista principal |
| Reseña pendiente | Solo autor/admin | No en ficha pública; confirmación al enviar |
| Claim documental | Sin OTP teléfono negocio | Etiqueta en admin; copy en formulario |
| Email corporativo OK / revisar | Señal admin | Chips en panel moderación |

**Evitar:** aspecto de “5 estrellas Amazon genérico”; preferir **números claros + conteo de reseñas + contexto de rol**.

---

## 10. Tono de marca y voz

- **Idioma:** español de España, tú, directo.
- **Personalidad:** transparente, ciudadano, firme sin moralizar; empático con inquilinos y propietarios por igual.
- **No:** lenguaje legalista en superficies públicas; hype startup; gamificación; rojo agresivo salvo errores.
- **Sí:** frases cortas que expliquen *por qué* pedimos móvil o documentos (“evita suplantaciones”, “como en Google Business”).

---

## 11. Dirección visual (para Stitch)

### 11.1 Sensación buscada

- **Confianza editorial:** fondos claros, mucho aire, tipografía legible, jerarquía fuerte. El usuario está tomando una decisión de alto riesgo (alquiler, delegación, conflicto); la UI debe sentirse **calmada y creíble**, no urgente ni “marketing”.
- **Neutros cálidos** en superficies (stone/zinc) + **marca fría y sobria** (slate o teal apagado) para navegación, enlaces y acciones de confianza.
- **Calor contenido** solo donde aporta semántica (p. ej. puntuación numérica), no como color dominante de toda la interfaz.
- **Densidad media-baja** en público; **más densa** en admin.

### 11.2 Color — decisión de producto (investigación, ago 2026)

**No usar un solo acento para todo.** El MVP actual concentra `amber` en marca, links, CTAs, notas y avisos; eso mezcla “valoración”, “alerta” y “identidad” y debilita la lectura de confianza.

| Criterio | Conclusión |
|----------|------------|
| Diferenciarse de Idealista/Fotocasa (verde portal) | Sí — evitar verde como color de marca principal. |
| Credibilidad en temas serios (reseñas, verificación) | Favorecer **fondos neutros** + acento **frío apagado** (slate/teal), no ámbar dominante. |
| Convención de estrellas / notas | **Oro/ámbar solo en el número o estrella**, no en nav ni títulos. |
| Verificado / moderado / éxito | **Un solo verde o teal** para badges de confianza; no mezclar con otro verde “éxito de formulario” sin reglas. |
| Avisos (sin teléfono, pasos claim) | Ámbar **solo** en banners de advertencia, no en logo. |

**Dirección recomendada para Stitch — “Archivo de confianza” (opción A):**

- Base: `stone-50` / blanco / texto `zinc-900` y `zinc-600`.
- **Marca** (logo, nav activo, links principales, CTA primario “confiar y continuar”): **slate profundo** o **teal oscuro apagado** (ej. slate-800, teal-800 desaturado). Sensación: dato público + verificación, no banco ni portal de anuncios.
- **Rating** (media inquilino/propietario): **ámbar u oro solo en la cifra** (ej. `amber-700`); títulos de tarjeta en neutro. Las dos tarjetas se distinguen por **rol y copy**, no por dos colores calientes distintos.
- **Trust badge** (“Verificada”, “Reseña revisada”): teal o verde **único** y consistente.
- **Warning** (“Contacto no verificado”, pasos sensibles): fondo ámbar muy suave + texto oscuro; no reutilizar el mismo tono en marca.
- **Danger / error:** rojo contenido (ya alineado con buenas prácticas).

**Alternativas si el equipo prefiere menos cambio (opción B — evolución del MVP):** mantener stone; bajar ámbar de links a un **terracotta/apagado**; reservar ámbar brillante solo a notas; unificar emerald público → teal.

**Evitar:** verde marca tipo Trustpilot (colisión mental con portales); gradientes morados SaaS; paleta “stone + amber en todo” (cliché genérico); dark mode a medias (beta = light consistente).

### 11.3 Tokens sugeridos (semantic roles)

Stitch puede nombrar tokens así; valores exactos pueden refinarse en `DESIGN.md`:

| Token | Rol | Dirección (Tailwind / hex orientativo) |
|-------|-----|----------------------------------------|
| `surface-canvas` | Fondo página | `#fafaf9` stone-50 |
| `surface-raised` | Cards | `#ffffff` + borde `stone-200` |
| `text-primary` | Títulos | zinc-900 |
| `text-secondary` | Cuerpo, meta | zinc-600 |
| `brand-primary` | Nav, links, CTA principal | slate-800 o teal-800 |
| `brand-primary-hover` | Hover links/botones | slate-700 / teal-700 |
| `rating-accent` | Solo cifra de nota | amber-700 (no usar en nav) |
| `trust-positive` | Verificada, moderado OK | teal-700 sobre teal-50 |
| `warning-muted` | Sin teléfono, revisar | amber-50 / amber-900 texto |
| `danger` | Errores | red-600 / red-50 |

**Tipografía:** Geist (ya en código) o equivalente sans neutra; jerarquía por peso y tamaño, no por color chillón.

### 11.4 Referencias de atmósfera (no copiar literal)

- Claridad tipo **Wikipedia / directorios públicos** en estructura.
- Seriedad de verificación tipo **Google Business Profile** (pasos, OTP, documentos).
- Separación de audiencias tipo **Glassdoor** (empleado vs empresa → aquí inquilino vs propietario) — **sin** copiar su verde de marca.

### 11.5 Anti-patrones (no hacer)

- Clonar ficha de Idealista (galerías de fotos, mapa gigante, CTAs de “llamar al anunciante”).
- Hero stock de llaves y casas felices ocupando media pantalla sin información.
- Una sola estrella gigante como única métrica.
- Gradientes morados “AI SaaS”.
- Dark mode obligatorio (opcional futuro; beta = claro y coherente).
- **Ámbar en logo, enlaces, notas y banners de aviso a la vez.**

### 11.6 Implementación actual (referencia técnica — a sustituir en rediseño)

- Stack: Next.js, Tailwind; fuentes **Geist**.
- **MVP hoy:** `stone-50`, acento `amber-700/800` muy extendido, `emerald` para éxito/verificado. Es **placeholder funcional**, no sistema de marca cerrado.
- **Objetivo del rediseño:** aplicar la tabla de tokens (§11.3) y la dirección “Archivo de confianza” (§11.2). No hace falta pixel-perfect con el MVP.

### 11.7 Prioridades de rediseño (pedido explícito del equipo)

1. **Home + explorar + ficha** — primera impresión y lectura de confianza.
2. **Tarjetas dual rating** — elemento distintivo de producto (jerarquía clara; color solo en la nota).
3. **Formularios largos** (añadir agencia, reclamar) — wizard claro, progreso, menos “caja de inputs”.
4. **Empty states y CTAs** (no resultados → añadir inmobiliaria).
5. Admin: legible, utilitaria; puede mantener más densidad y menos “marca”.

---

## 12. Responsive y accesibilidad

- **Mobile-first:** mucha búsqueda desde móvil al buscar piso.
- Targets táctiles generosos en formularios SMS.
- Contraste **WCAG AA** mínimo: cuerpo en `zinc-600` sobre `stone-50`; evitar ámbar como color de texto largo.
- Formularios con labels visibles (no solo placeholder).
- No depender del color solo para estado (badges con texto: “Verificada”, “Contacto no verificado”).

---

## 13. Fuera de alcance (no diseñar ahora)

- Mapas interactivos, comparador de pisos, chat, pagos.
- App nativa.
- Internacionalización fuera de España.
- Perfil de usuario “Mi cuenta” completo (futuro).
- Tienda Chrome de extensión (solo mencionar en roadmap).

---

## 14. Glosario rápido

| Término | Significado en Fachada |
|---------|------------------------|
| Inmobiliaria / agencia | Empresa de gestión, no el piso |
| Ficha | Página pública de una agencia |
| Claim / reclamar | Solicitud de control del perfil |
| Moderación | Humana, antes de mostrar reseña en beta |
| Rol | Inquilino o propietario (afecta media y filtros) |

---

## 15. Prompt corto para pegar en Stitch (opcional)

> Diseña la interfaz web de **Fachada**, directorio español de reseñas sobre **gestión inmobiliaria** (no anuncios de pisos). Público: inquilinos y propietarios. Diferenciador: **dos valoraciones** (inquilino vs propietario) en cada ficha. Estilo: **archivo de confianza** — fondos stone/zinc claros, marca **slate o teal oscuro apagado** (links, nav, CTAs), **ámbar/oro solo en la cifra de nota**, un verde/teal para badges “verificada/moderado”, ámbar suave solo en avisos. Sin verde portal tipo Idealista ni morado SaaS. Pantallas: home, explorar por ciudad, ficha con reseñas por rol, añadir inmobiliaria (checkbox sin teléfono online), reclamar perfil multi-paso. Mobile-first, español España.

---

*Última actualización: agosto 2026 (color: dirección “archivo de confianza”). Producto: repo `fachada`. Docs relacionados: `producto-fase-2.md`, `verificacion-inmobiliarias.md`.*
