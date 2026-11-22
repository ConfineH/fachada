export const NARRATIVE_MIN_LENGTH = 40;
export const NARRATIVE_MAX_LENGTH = 900;
export const REVIEW_BODY_MAX_LENGTH = 1000;
export const SIDE_MIN_LENGTH = 10;
export const SIDE_MAX_LENGTH = 450;

const RELATO_FORMAT = "fachada-relato";
const RELATO_VERSION = 1;

/**
 * A useful Spanish sentence is around this floor
 * («Tardaron tres semanas en devolver la fianza.» is 46).
 * Ten characters is a fragment and does not help the next reader.
 * The ceiling is the longest narrative whose versioned body still fits
 * the existing `char_length(body) <= 1000` check, with room for JSON escapes.
 */
export function narrativeLengthError(narrative: string): string | null {
  const trimmed = narrative.trim();
  if (trimmed.length < NARRATIVE_MIN_LENGTH) {
    return `Cuéntanos la experiencia con al menos ${NARRATIVE_MIN_LENGTH} caracteres. Una frase concreta basta.`;
  }
  if (
    trimmed.length > NARRATIVE_MAX_LENGTH ||
    composeRelatoBody(trimmed).length > REVIEW_BODY_MAX_LENGTH
  ) {
    return `El relato no puede pasar de ${NARRATIVE_MAX_LENGTH} caracteres.`;
  }
  return null;
}

export function optionalSideError(
  value: string | undefined,
  required: boolean,
  label: "ventajas" | "desventajas",
): string | null {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) {
    return required
      ? `Las ${label} deben tener al menos ${SIDE_MIN_LENGTH} caracteres`
      : null;
  }
  if (trimmed.length < SIDE_MIN_LENGTH) {
    return `Las ${label} deben tener al menos ${SIDE_MIN_LENGTH} caracteres`;
  }
  if (trimmed.length > SIDE_MAX_LENGTH) {
    return `Las ${label} no pueden pasar de ${SIDE_MAX_LENGTH} caracteres`;
  }
  return null;
}

export function composeReviewBody(pros: string, cons: string) {
  return `Ventajas: ${pros.trim()}\n\nDesventajas: ${cons.trim()}`;
}

export function composeRelatoBody(narrative: string) {
  return JSON.stringify({
    format: RELATO_FORMAT,
    v: RELATO_VERSION,
    narrative: narrative.trim(),
  });
}

export function storedReviewTitle(narrative: string) {
  const collapsed = narrative.trim().replace(/\s+/g, " ");
  return collapsed.slice(0, 100);
}

export function parseRelatoBody(body: string): { narrative: string } | null {
  let value: unknown;
  try {
    value = JSON.parse(body);
  } catch {
    return null;
  }
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  if (Object.keys(record).length !== 3) return null;
  if (record.format !== RELATO_FORMAT || record.v !== RELATO_VERSION) return null;
  if (typeof record.narrative !== "string") return null;
  const narrative = record.narrative.trim();
  if (!narrative) return null;
  if (body !== composeRelatoBody(narrative)) return null;
  return { narrative };
}

/**
 * Legacy structured reviews are the ones the composer still reproduces
 * exactly from both sides. A body that merely starts with «Ventajas:»
 * is not enough: the prose review already in the archive does not use
 * that template, and a new relato is a versioned object, not that prefix.
 */
export function structuredSides(
  body: string,
  pros?: string,
  cons?: string,
): { pros: string; cons: string } | null {
  const columnPros = pros?.trim() ?? "";
  const columnCons = cons?.trim() ?? "";
  const trimmed = body.trim();
  if (
    columnPros &&
    columnCons &&
    trimmed === composeReviewBody(columnPros, columnCons)
  ) {
    return { pros: columnPros, cons: columnCons };
  }
  const match = trimmed.match(/^Ventajas: ([\s\S]*)\n\nDesventajas: ([\s\S]*)$/);
  if (!match?.[1] || !match[2]) return null;
  const parsedPros = match[1].trim();
  const parsedCons = match[2].trim();
  if (!parsedPros || !parsedCons) return null;
  if (trimmed !== composeReviewBody(parsedPros, parsedCons)) return null;
  if (
    (columnPros && columnPros !== parsedPros) ||
    (columnCons && columnCons !== parsedCons)
  ) {
    return null;
  }
  return { pros: parsedPros, cons: parsedCons };
}

export type ReviewFormat = "relato" | "structured" | "prose";

export function classifyReview(review: {
  body: string;
  pros?: string;
  cons?: string;
}): ReviewFormat {
  if (parseRelatoBody(review.body)) return "relato";
  if (structuredSides(review.body, review.pros, review.cons)) return "structured";
  return "prose";
}

export function reviewPublicCopy(review: {
  title?: string;
  body: string;
  pros?: string;
  cons?: string;
}): {
  format: ReviewFormat;
  title?: string;
  narrative?: string;
  pros?: string;
  cons?: string;
  prose?: string;
} {
  const relato = parseRelatoBody(review.body);
  if (relato) {
    return {
      format: "relato",
      narrative: relato.narrative,
      pros: review.pros?.trim() || undefined,
      cons: review.cons?.trim() || undefined,
    };
  }
  const sides = structuredSides(review.body, review.pros, review.cons);
  if (sides) {
    return {
      format: "structured",
      title: review.title?.trim() || undefined,
      pros: sides.pros,
      cons: sides.cons,
    };
  }
  return {
    format: "prose",
    title: review.title?.trim() || undefined,
    prose: review.body,
    pros: review.pros?.trim() || undefined,
    cons: review.cons?.trim() || undefined,
  };
}

export function reviewPublicExcerpt(review: {
  title?: string;
  body: string;
  pros?: string;
  cons?: string;
}) {
  const copy = reviewPublicCopy(review);
  if (copy.narrative) return copy.narrative;
  if (copy.prose) return copy.prose;
  return [copy.pros, copy.cons].filter(Boolean).join("\n\n");
}

export function reviewProsCons(review: {
  pros?: string;
  cons?: string;
  body: string;
  title?: string;
}): { pros?: string; cons?: string; body?: string } {
  const copy = reviewPublicCopy(review);
  if (copy.format === "structured") return { pros: copy.pros, cons: copy.cons };
  if (copy.format === "relato") {
    return { pros: copy.pros, cons: copy.cons, body: copy.narrative };
  }
  return { pros: copy.pros, cons: copy.cons, body: copy.prose };
}

export function reviewEditError(
  format: ReviewFormat,
  data: {
    narrative?: string;
    title?: string;
    pros?: string;
    cons?: string;
    body?: string;
  },
): string | null {
  if (format === "relato") {
    return (
      narrativeLengthError(data.narrative ?? "") ??
      optionalSideError(data.pros, false, "ventajas") ??
      optionalSideError(data.cons, false, "desventajas")
    );
  }
  if (format === "structured") {
    const title = data.title?.trim() ?? "";
    if (!title || title.length > 100) return "El título es obligatorio";
    return (
      optionalSideError(data.pros, true, "ventajas") ??
      optionalSideError(data.cons, true, "desventajas")
    );
  }
  const title = data.title?.trim() ?? "";
  const body = data.body?.trim() ?? "";
  if (!title || title.length > 100) return "El título es obligatorio";
  if (!body || body.length > REVIEW_BODY_MAX_LENGTH) {
    return "El texto de la reseña es obligatorio";
  }
  return (
    optionalSideError(data.pros, false, "ventajas") ??
    optionalSideError(data.cons, false, "desventajas")
  );
}

export const EXPERIENCE_LABELS = {
  declarada: "Experiencia declarada",
  acreditada: "Experiencia acreditada",
} as const;

export function experiencePublicLabel(level: "declarada" | "acreditada") {
  return EXPERIENCE_LABELS[level];
}

export function reviewPublicByline(review: {
  anonymous: boolean;
  publicName?: string;
  role: "inquilino" | "propietario";
}) {
  const role = review.role === "inquilino" ? "Inquilino" : "Propietario";
  if (review.anonymous || !review.publicName?.trim()) return role;
  return `${review.publicName.trim()} · ${role}`;
}
