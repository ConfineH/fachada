import type { ContentNoticeCategory } from "@/lib/domain/types";

/** Motivos tasados del formulario público. Los valores antiguos siguen siendo válidos en expedientes ya abiertos. */
export const PUBLIC_NOTICE_REASONS = [
  ["personal_data", "Datos personales"],
  ["false_statement", "Hecho falso"],
  ["not_customer", "No fue cliente"],
  ["offensive_or_crime", "Contenido ofensivo o acusación de delito"],
  ["spam", "Spam o reseña falsa"],
  ["other", "Otro"],
] as const satisfies ReadonlyArray<readonly [ContentNoticeCategory, string]>;

const LEGACY_NOTICE_LABELS: Partial<Record<ContentNoticeCategory, string>> = {
  honor: "Honor o reputación",
  privacy: "Intimidad",
  threat: "Amenaza o acoso",
  intellectual_property: "Propiedad intelectual",
  fake_experience: "Experiencia presuntamente falsa",
  other_illegal: "Otro contenido presuntamente ilícito",
};

export function noticeReasonLabel(category: ContentNoticeCategory) {
  const current = PUBLIC_NOTICE_REASONS.find(([value]) => value === category);
  return current?.[1] ?? LEGACY_NOTICE_LABELS[category] ?? category;
}

/** Datos personales o acusación de delito (el motivo ofensivo incluye esa acusación). */
export function noticeHidesProvisionally(category: ContentNoticeCategory) {
  return category === "personal_data" || category === "offensive_or_crime";
}

export function noticeQueueRisk(category: ContentNoticeCategory) {
  return noticeHidesProvisionally(category) ? 0 : 1;
}
