/**
 * Actualiza a mano la tabla IRAV de src/lib/domain/tools/constants.ts.
 * No se llama al calcular una subida. Uso: npm run update-irav
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { inePointsByMonth, iravPublication, parseIneSeries } from "./irav-parse.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const constantsPath = join(root, "src", "lib", "domain", "tools", "constants.ts");
const api = "https://servicios.ine.es/wstempus/js/ES/DATOS_SERIE/IRAV1?nult=36";

const response = await fetch(api);
if (!response.ok) {
  throw new Error(`El INE ha respondido ${response.status}. La tabla no se ha tocado.`);
}

const payload = await response.json();
const incoming = parseIneSeries(payload);
const points = inePointsByMonth(payload);
const today = new Date();
const loadedOn = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

const source = readFileSync(constantsPath, "utf8");
const existing = new Map();
for (const match of source.matchAll(/month: "(\d{4}-\d{2})", value: (-?\d+(?:\.\d+)?)/g)) {
  existing.set(match[1], Number(match[2]));
}
for (const row of incoming) existing.set(row.month, row.value);

const rows = [...existing.entries()]
  .sort(([left], [right]) => left.localeCompare(right))
  .map(([month, value]) => {
    const publication = iravPublication(month, points.get(month) ?? null);
    return `  { month: "${month}", value: ${value}, source: IRAV_SOURCE_URL, loadedOn: "${loadedOn}", publishedOn: "${publication.publishedOn}", publishedOnEstimated: ${publication.publishedOnEstimated} },`;
  });

const table = `// IRAV_TABLE_START
export const IRAV_TABLE: readonly IravRow[] = [
${rows.join("\n")}
];
// IRAV_TABLE_END`;

const next = source
  .replace(/export const IRAV_LOADED_ON = "\d{4}-\d{2}-\d{2}";/, `export const IRAV_LOADED_ON = "${loadedOn}";`)
  .replace(/\/\/ IRAV_TABLE_START[\s\S]*?\/\/ IRAV_TABLE_END/, table);

if (next === source) {
  console.log(`IRAV sin cambios. Último mes ${rows.at(-1)?.match(/month: "([^"]+)"/)?.[1] ?? "?"}, cargado el ${loadedOn}.`);
} else {
  writeFileSync(constantsPath, next);
  const last = [...existing.entries()].sort(([left], [right]) => left.localeCompare(right)).at(-1);
  console.log(`IRAV actualizado. Último mes ${last?.[0]} = ${last?.[1]} %. Cargado el ${loadedOn}.`);
}
