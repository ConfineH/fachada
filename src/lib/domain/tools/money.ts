export function roundCents(eur: number): number | null {
  if (!Number.isFinite(eur)) return null;
  return Math.round(eur * 100) / 100;
}

/** es-ES currency with a thousands dot. Node's ICU build sometimes omits grouping. */
export function formatEuro(eur: number): string {
  const negative = eur < 0;
  const cents = Math.round(Math.abs(eur) * 100);
  const whole = Math.floor(cents / 100);
  const fraction = String(cents % 100).padStart(2, "0");
  const grouped = String(whole).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${negative ? "−" : ""}${grouped},${fraction} €`;
}

/**
 * Accepts Spanish amounts: `1200`, `1200,50`, `1.200,50`, `1.200`.
 * A lone dot is the decimal separator only when it is not a thousands group.
 */
export function parseEuroInput(raw: string): number | null {
  const trimmed = raw.trim().replace(/\s/g, "").replace(/€/g, "");
  if (!trimmed) return null;

  let normalized = trimmed;
  if (trimmed.includes(",")) {
    normalized = trimmed.replace(/\./g, "").replace(",", ".");
  } else if (/^\d{1,3}(\.\d{3})+$/.test(trimmed)) {
    normalized = trimmed.replace(/\./g, "");
  }

  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;
  const value = Number(normalized);
  return Number.isFinite(value) ? value : null;
}
