# Extensión local Fachada

Prototipo interno, independiente y no afiliado, autorizado ni respaldado por
Idealista. No se publica en Chrome Web Store, no se entrega en campaña y no
se usa para extraer, almacenar o monitorizar anuncios. Solo lee, en la
página que el usuario ha abierto, el nombre visible del anunciante y consulta
la API propia de Fachada.

Instrucciones para testers (cuatro pasos, aviso de Chrome, qué no hace):
[`/extension`](../../src/app/extension/page.tsx) en local o
https://fachada.app/extension

La distribución pública queda bloqueada hasta obtener permiso escrito de
Idealista o rediseñar la integración para no ejecutar código en su sitio.

1. Deja la carpeta `extension/idealista` en un sitio fijo. No la borres.
2. Chrome → `chrome://extensions` → Modo de desarrollador (arriba a la
   derecha; si no, no aparece el botón).
3. **Cargar descomprimida** → esta carpeta.
4. Abre un anuncio de alquiler en Idealista.

Opcional en consola de Idealista, solo para desarrollo local:
`localStorage.setItem('fachada_api_base','http://localhost:3000')`

Por defecto usa `https://fachada.app` y
`GET /api/agencies/match?name=`. El badge muestra el motivo
(«Coincide con … · N experiencias») o «Sin datos Fachada».

La API responde con CORS `*` para lectura desde la extensión.
