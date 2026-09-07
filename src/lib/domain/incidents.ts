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
