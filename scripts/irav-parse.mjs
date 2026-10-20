/** Lee la serie IRAV1 del INE (JSON de wstempus). El mes sale de Anyo y FK_Periodo. */

export function parseIneSeries(payload) {
  const data = Array.isArray(payload) ? payload : payload?.Data;
  if (!Array.isArray(data)) {
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

function referenceMonth(point) {
  const year = point?.Anyo;
  const period = point?.FK_Periodo;
  if (!Number.isInteger(year) || !Number.isInteger(period) || period < 1 || period > 12) {
    return null;
  }
  return `${year}-${String(period).padStart(2, "0")}`;
}
