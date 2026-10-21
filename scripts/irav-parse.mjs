/** Lee la serie IRAV1 del INE (JSON de wstempus). El mes sale de Anyo y FK_Periodo. */

const PUBLICATION_KEYS = ["FechaPublicacion", "fechaPublicacion", "Publicacion"];

export function parseIneSeries(payload) {
  const data = seriesData(payload);
  if (!data) {
    throw new Error("El INE no ha devuelto la serie IRAV1.");
  }

  const byMonth = new Map();
  for (const point of data) {
    const month = referenceMonth(point);
    const value = point?.Valor;
    if (!month || typeof value !== "number" || !Number.isFinite(value)) continue;
    byMonth.set(month, value);
  }

  if (byMonth.size === 0) {
    throw new Error("La respuesta del INE no trae ningún mes de IRAV.");
  }

  return [...byMonth.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([month, value]) => ({ month, value }));
}

/** Último punto de cada mes, para leer una fecha de publicación si el INE la manda. */
export function inePointsByMonth(payload) {
  const data = seriesData(payload) ?? [];
  const byMonth = new Map();
  for (const point of data) {
    const month = referenceMonth(point);
    if (month) byMonth.set(month, point);
  }
  return byMonth;
}

/**
 * Fecha de publicación del INE (YYYY-MM-DD). `Fecha` no vale: en IRAV1 es el
 * último día del mes anterior, no el día en que el INE publica el índice.
 * Si el punto no trae fecha, el día 15 del mes siguiente y estimated true.
 */
export function iravPublication(month, point) {
  const publishedOn = readPublication(point);
  if (publishedOn) return { publishedOn, publishedOnEstimated: false };
  return { publishedOn: estimatedPublication(month), publishedOnEstimated: true };
}

export function estimatedPublication(month) {
  const match = /^(\d{4})-(\d{2})$/.exec(month);
  if (!match) throw new Error(`Mes IRAV no válido: ${month}`);
  const year = Number(match[1]);
  const mon = Number(match[2]);
  if (mon < 1 || mon > 12) throw new Error(`Mes IRAV no válido: ${month}`);
  return new Date(Date.UTC(year, mon, 15)).toISOString().slice(0, 10);
}

function seriesData(payload) {
  const data = Array.isArray(payload) ? payload : payload?.Data;
  return Array.isArray(data) ? data : null;
}

function referenceMonth(point) {
  const year = point?.Anyo;
  const period = point?.FK_Periodo;
  if (!Number.isInteger(year) || !Number.isInteger(period) || period < 1 || period > 12) {
    return null;
  }
  return `${year}-${String(period).padStart(2, "0")}`;
}

function readPublication(point) {
  if (!point || typeof point !== "object") return null;
  for (const key of PUBLICATION_KEYS) {
    const value = point[key];
    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    if (typeof value === "number" && Number.isFinite(value)) {
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) continue;
      return date.toISOString().slice(0, 10);
    }
  }
  return null;
}
