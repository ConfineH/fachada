# Extensión Idealista (MVP)

1. Chrome → `chrome://extensions` → Modo desarrollador → **Cargar descomprimida** → carpeta `extension/idealista`.
2. Opcional en consola de Idealista: `localStorage.setItem('fachada_api_base','http://localhost:3000')` para dev local.
3. Por defecto usa `https://fachada-tau.vercel.app` y `GET /api/agencies/match?name=`.

La API responde con CORS `*` para lectura desde la extensión.
