export const REVIEW_TERMS_VERSION = "2026-09-legal-hardening-v1";
export const MAX_EXPERIENCE_AGE_DAYS = 30;

const DAY_MS = 24 * 60 * 60 * 1000;

export function experienceDateError(
  value: Date,
  now = new Date(),
): string | null {
  const experienceDay = Date.UTC(
    value.getUTCFullYear(),
    value.getUTCMonth(),
    value.getUTCDate(),
  );
  const today = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
  );
  const ageDays = Math.floor((today - experienceDay) / DAY_MS);

  if (ageDays < 0) return "La fecha de la experiencia no puede ser futura";
  if (ageDays > MAX_EXPERIENCE_AGE_DAYS) {
    return `La última interacción debe haber ocurrido en los últimos ${MAX_EXPERIENCE_AGE_DAYS} días`;
  }
  return null;
}
