import { reviewPublicCopy } from "@/lib/domain/review-copy";
import type { UserRole } from "@/lib/domain/types";

/**
 * The two answers shown on the homepage and in its FAQPage schema.
 * They are the same strings: the visible FAQ and the JSON-LD cannot diverge.
 */
export const HOME_PAGE_FAQS = [
  {
    question: "¿Fachada verifica que la experiencia ocurrió?",
    answer:
      "No de forma automática. Con el correo verificado se publica como experiencia declarada. Acreditada, solo si una persona revisa pruebas.",
  },
  {
    question: "¿Puede una inmobiliaria borrar una reseña negativa?",
    answer:
      "No. Puede responder, no eliminar la opinión. Una crítica no se retira por ser negativa, por petición especial ni por pago. Sí puede restringirse si incumple las normas, es ilícita o falsa, o vulnera derechos. Si se restringe, se comunica la regla y el motivo.",
  },
] as const;

const MANAGEMENT_STEMS = [
  "mantenimiento",
  "cobro",
  "fianza",
  "reparacion",
  "arreglo",
  "honorario",
  "comunicacion",
  "contest",
  "gestion",
  "gestor",
] as const;

const HOME_EXCERPT_LIMIT = 2;

export type HomeExcerptReview = {
  role: UserRole;
  rating: number;
  createdAt?: Date | string;
  title?: string;
  body: string;
  pros?: string;
  cons?: string;
};

export type HomeExcerptSource = {
  slug: string;
  name: string;
  reviews: HomeExcerptReview[];
};

export type HomeExcerpt = {
  slug: string;
  name: string;
  role: "inquilino" | "propietario";
  rating: number;
  text: string;
};

function fold(value: string) {
  return value.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
}

function mentionsManagement(value: string) {
  const folded = fold(value);
  return MANAGEMENT_STEMS.some((stem) =>
    new RegExp(`\\b${stem}`, "i").test(folded),
  );
}

function sentencesOf(value: string) {
  const source = value.replace(/\s+/g, " ").trim();
  if (!source) return [];
  return [...source.matchAll(/[^.!?]*[.!?]+|[^.!?]+$/g)]
    .map((match) => match[0].trim())
    .filter(Boolean);
}

function managementClause(sentence: string) {
  if (!mentionsManagement(sentence)) return null;
  let start = 0;
  while (start < sentence.length) {
    const comma = sentence.indexOf(",", start);
    const end = comma === -1 ? sentence.length : comma;
    if (mentionsManagement(sentence.slice(start, end))) {
      return sentence.slice(start).trim();
    }
    if (comma === -1) return null;
    start = comma + 1;
  }
  return null;
}

export function managementFragment(review: HomeExcerptReview) {
  const copy = reviewPublicCopy(review);
  const sources = [copy.narrative, copy.prose, copy.pros, copy.cons];
  for (const source of sources) {
    if (!source) continue;
    const normalized = source.replace(/\s+/g, " ").trim();
    for (const sentence of sentencesOf(source)) {
      const clause = managementClause(sentence);
      if (!clause || !normalized.includes(clause)) continue;
      return clause;
    }
  }
  return null;
}

function publishedAt(review: HomeExcerptReview) {
  if (!review.createdAt) return 0;
  const at = new Date(review.createdAt).getTime();
  return Number.isNaN(at) ? 0 : at;
}

export function selectHomeExcerpts(agencies: HomeExcerptSource[]) {
  const found: Array<HomeExcerpt & { at: number }> = [];
  for (const agency of agencies) {
    for (const review of agency.reviews) {
      const text = managementFragment(review);
      if (!text) continue;
      found.push({
        slug: agency.slug,
        name: agency.name,
        role: review.role === "propietario" ? "propietario" : "inquilino",
        rating: review.rating,
        text,
        at: publishedAt(review),
      });
      break;
    }
  }

  return found
    .toSorted(
      (a, b) => b.at - a.at || a.name.localeCompare(b.name, "es"),
    )
    .slice(0, HOME_EXCERPT_LIMIT)
    .toSorted((a, b) => a.name.localeCompare(b.name, "es"))
    .map(({ slug, name, role, rating, text }) => ({
      slug,
      name,
      role,
      rating,
      text,
    }));
}
