export const INCIDENT_TAGS = [
  "honorarios_gestion",
  "seguro_impuesto",
  "fianza",
  "reparaciones",
  "comunicacion",
  "renovacion",
  "otros",
] as const;

export type IncidentTag = (typeof INCIDENT_TAGS)[number];

export const INCIDENT_TAG_LABELS: Record<IncidentTag, string> = {
  honorarios_gestion: "Honorarios o gestión al inquilino",
  seguro_impuesto: "Seguro u otro servicio impuesto",
  fianza: "Fianza o depósito",
  reparaciones: "Reparaciones e incidencias",
  comunicacion: "Comunicación o respuesta",
  renovacion: "Renovación o salida",
  otros: "Otro",
};

export function isIncidentTag(value: string): value is IncidentTag {
  return (INCIDENT_TAGS as readonly string[]).includes(value);
}

export type IncidentSentiment = "positiva" | "negativa";

export type IncidentSentiments = Partial<Record<IncidentTag, IncidentSentiment>>;

export function parseIncidentSentiments(value: unknown): IncidentSentiments {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const result: IncidentSentiments = {};
  for (const [key, sentiment] of Object.entries(value)) {
    if (!isIncidentTag(key)) continue;
    if (sentiment === "positiva" || sentiment === "negativa") {
      result[key] = sentiment;
    }
  }
  return result;
}

export function tagsFromSentiments(sentiments: IncidentSentiments): IncidentTag[] {
  return INCIDENT_TAGS.filter((tag) => sentiments[tag]);
}

export type IncidentSentimentSummary = {
  tag: IncidentTag;
  label: string;
  positiva: number;
  negativa: number;
};

export function summarizeIncidentSentiments(
  reviews: { incidentSentiments?: IncidentSentiments }[],
): IncidentSentimentSummary[] {
  const counts = new Map<IncidentTag, { positiva: number; negativa: number }>();
  for (const review of reviews) {
    for (const [tag, sentiment] of Object.entries(review.incidentSentiments ?? {})) {
      if (!isIncidentTag(tag)) continue;
      if (sentiment !== "positiva" && sentiment !== "negativa") continue;
      const current = counts.get(tag) ?? { positiva: 0, negativa: 0 };
      current[sentiment] += 1;
      counts.set(tag, current);
    }
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({
      tag,
      label: INCIDENT_TAG_LABELS[tag],
      positiva: count.positiva,
      negativa: count.negativa,
    }))
    .sort(
      (a, b) =>
        b.positiva + b.negativa - (a.positiva + a.negativa) ||
        a.label.localeCompare(b.label, "es"),
    );
}

export type IncidentMark = IncidentSentiment | "unset";

export type IncidentMarks = Partial<Record<IncidentTag, IncidentMark>>;

export function sentimentsFromMarks(marks: IncidentMarks): IncidentSentiments {
  const result: IncidentSentiments = {};
  for (const tag of INCIDENT_TAGS) {
    const mark = marks[tag];
    if (mark === "positiva" || mark === "negativa") result[tag] = mark;
  }
  return result;
}

export function unsetMarkMessage(marks: IncidentMarks): string | null {
  for (const tag of INCIDENT_TAGS) {
    if (marks[tag] === "unset") {
      return `No se ha publicado la reseña porque no has dicho si «${INCIDENT_TAG_LABELS[tag]}» fue bien o mal.`;
    }
  }
  return null;
}

export function parseIncidentTags(values: unknown): IncidentTag[] {
  if (!Array.isArray(values)) return [];
  const unique = new Set<IncidentTag>();
  for (const value of values) {
    if (typeof value === "string" && isIncidentTag(value)) {
      unique.add(value);
    }
  }
  return [...unique];
}
