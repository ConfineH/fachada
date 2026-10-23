import type { ToolDefinition } from "@/lib/domain/tools/catalog";

export const REVIEW_ORIGINS = [
  "honorarios",
  "fianza",
  "reparaciones",
  "desistimiento",
  "acta",
  "subida",
] as const;

export type ReviewOrigin = (typeof REVIEW_ORIGINS)[number];

export const REVIEW_ORIGIN_LABELS: Record<ReviewOrigin, string> = {
  honorarios: "Honorarios",
  fianza: "Fianza",
  reparaciones: "Reparaciones",
  desistimiento: "Desistimiento",
  acta: "Acta de llaves",
  subida: "Subida del alquiler",
};

const ORIGIN_SET = new Set<string>(REVIEW_ORIGINS);

export function parseReviewOrigin(value: unknown): ReviewOrigin | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return ORIGIN_SET.has(trimmed) ? (trimmed as ReviewOrigin) : undefined;
}

export function toolReviewOrigin(id: ToolDefinition["id"]): ReviewOrigin {
  switch (id) {
    case "salida-anticipada":
      return "desistimiento";
    case "acta-entrega-llaves":
      return "acta";
    case "subida-alquiler":
      return "subida";
    default:
      return id;
  }
}

/** Keeps ?desde= on the next hop. Drops anything that is not a calculator. */
export function withReviewOrigin(path: string, origin: string | undefined) {
  const parsed = parseReviewOrigin(origin);
  if (!parsed) return path;
  const [pathname, query = ""] = path.split("?");
  const params = new URLSearchParams(query);
  params.set("desde", parsed);
  return `${pathname}?${params.toString()}`;
}
