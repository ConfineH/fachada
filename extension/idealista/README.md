# Extensión local Fachada

Prototipo interno, independiente y no afiliado, autorizado ni respaldado por
Idealista. No se publica en ninguna Store, no se entrega a testers externos y
no se usa para extraer, almacenar o monitorizar anuncios. Solo lee, en la
página que el usuario ha abierto, el nombre visible del anunciante y consulta
la API propia de Fachada.

La distribución queda bloqueada hasta obtener permiso escrito de Idealista o
rediseñar la integración para no ejecutar código en su sitio. El permiso debe
cubrir nombre/marca, lectura del DOM, consulta por anunciante, distribución y
límites de uso. Guardar la respuesta escrita en el expediente contractual.

1. Chrome → `chrome://extensions` → Modo desarrollador → **Cargar descomprimida** → carpeta `extension/idealista`.
2. Opcional en consola de Idealista: `localStorage.setItem('fachada_api_base','http://localhost:3000')` para dev local.
3. Por defecto usa `https://fachada-tau.vercel.app` y `GET /api/agencies/match?name=`.

La API responde con CORS `*` para lectura desde la extensión.
