import { addMonths, formatIsoDate } from "@/lib/domain/tools/dates";

export const REVIEW_TERMS_VERSION = "2026-10-publicacion-inmediata-v1";

/**
 * Calendar months, not a fixed day count. 36 months is three years, and a
 * day count (1095 or 1096) drifts when the window contains 29 February.
 * The earliest allowed day is the same day-of-month 36 months earlier,
 * clamped to the last day of that month (29 Feb → 28 Feb in a non-leap year).
 */
export const MAX_EXPERIENCE_AGE_MONTHS = 36;

export const WHOLE_NUMBER_RATING_ERROR =
  "No se ha publicado la reseña porque la nota no es un número entero. Solo puedes usar 1, 2, 3, 4 o 5.";

export function earliestExperienceIso(now = new Date()): string {
  const today = formatIsoDate(now);
  return addMonths(today, -MAX_EXPERIENCE_AGE_MONTHS) ?? today;
}

export function experienceDateError(
  value: Date,
  now = new Date(),
): string | null {
  if (Number.isNaN(value.getTime())) {
    return "Indica la fecha de tu última interacción.";
  }
  const experienceIso = formatIsoDate(value);
  const todayIso = formatIsoDate(now);

  if (experienceIso > todayIso) {
    return "La fecha de la experiencia no puede ser futura";
  }
  if (experienceIso < earliestExperienceIso(now)) {
    return `La última interacción debe haber ocurrido en los últimos ${MAX_EXPERIENCE_AGE_MONTHS} meses`;
  }
  return null;
}
