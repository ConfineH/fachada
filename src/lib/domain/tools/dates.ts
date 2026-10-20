const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Calendar date as YYYY-MM-DD, compared and shifted in UTC so the local timezone never moves the day. */
export function parseIsoDate(value: string): Date | null {
  const match = ISO_DATE.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return date;
}

export function formatIsoDate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function addDays(iso: string, days: number): string | null {
  const date = parseIsoDate(iso);
  if (!date || !Number.isInteger(days)) return null;
  date.setUTCDate(date.getUTCDate() + days);
  return formatIsoDate(date);
}

/** Same day-of-month, clamped to the last day when the target month is shorter. */
export function addMonths(iso: string, months: number): string | null {
  const date = parseIsoDate(iso);
  if (!date || !Number.isInteger(months)) return null;
  const day = date.getUTCDate();
  const cursor = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
  cursor.setUTCMonth(cursor.getUTCMonth() + months);
  const lastDay = new Date(
    Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth() + 1, 0),
  ).getUTCDate();
  cursor.setUTCDate(Math.min(day, lastDay));
  return formatIsoDate(cursor);
}

export function daysBetween(startIso: string, endIso: string): number | null {
  const start = parseIsoDate(startIso);
  const end = parseIsoDate(endIso);
  if (!start || !end) return null;
  return Math.round((end.getTime() - start.getTime()) / 86_400_000);
}

/**
 * Whole calendar months from `start` up to `end`, plus leftover days divided by
 * the length of the following month. A move that lands on the same day N months
 * later is exactly N.
 */
export function monthsBetween(startIso: string, endIso: string): number | null {
  if (!parseIsoDate(startIso) || !parseIsoDate(endIso)) return null;
  if (endIso <= startIso) return 0;

  let whole = 0;
  let cursor = startIso;
  while (whole < 2400) {
    const next = addMonths(cursor, 1);
    if (!next || next > endIso) break;
    whole += 1;
    cursor = next;
  }

  const nextMonth = addMonths(cursor, 1);
  const elapsed = daysBetween(cursor, endIso);
  const monthLength = nextMonth ? daysBetween(cursor, nextMonth) : null;
  if (elapsed === null || monthLength === null || monthLength <= 0) return null;
  return whole + elapsed / monthLength;
}

export function formatSpanishDate(iso: string): string {
  const date = parseIsoDate(iso);
  if (!date) return iso;
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function localTodayIso(now = new Date()): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
