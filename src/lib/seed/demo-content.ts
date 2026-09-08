import { randomUUID } from "node:crypto";

import { composeReviewBody } from "@/lib/domain/review-copy";
import type { AgencyNameAlias, Review } from "@/lib/domain/types";

type SeedReview = Omit<Review, "id" | "userId" | "agencyId" | "createdAt"> & {
  agencySlug: string;
};

type SeedAlias = Omit<AgencyNameAlias, "id" | "agencyId"> & {
  agencySlug: string;
};

export const DEMO_ALIASES: SeedAlias[] = [
  {
    agencySlug: "inmobiliaria-javier-valencia",
    alias: "Javier Inmobiliaria",
    kind: "commercial",
    note: "Nombre habitual en portales",
  },
  {
    agencySlug: "inmobiliaria-sol-madrid",
    alias: "Sol Inmobiliaria Madrid",
    kind: "commercial",
  },
];

function demoReview(
  seed: Omit<SeedReview, "body" | "anonymous" | "helpfulCount"> & {
    pros: string;
    cons: string;
  },
): SeedReview {
  return {
    ...seed,
    body: composeReviewBody(seed.pros, seed.cons),
    anonymous: true,
    helpfulCount: 0,
  };
}

export const DEMO_REVIEWS: SeedReview[] = [
  demoReview({
    agencySlug: "inmobiliaria-sol-madrid",
    role: "inquilino",
    rating: 2,
    title: "Lenta en reparaciones",
    pros: "El contrato estaba claro y el cobro de la renta era puntual.",
    cons: "Tardaron semanas en enviar al fontanero y la comunicación fue escasa.",
    incidentTags: ["reparaciones", "comunicacion"],
    moderated: true,
    flagged: false,
    wouldRecommend: false,
  }),
  demoReview({
    agencySlug: "inmobiliaria-sol-madrid",
    role: "propietario",
    rating: 5,
    title: "Cobros puntuales",
    pros: "Siempre ingresan el alquiler a tiempo y avisan de cualquier incidencia.",
    cons: "Poco margen para decidir proveedores de mantenimiento.",
    incidentTags: ["comunicacion"],
    moderated: true,
    flagged: false,
    wouldRecommend: true,
  }),
  demoReview({
    agencySlug: "gestion-urbana-madrid",
    role: "inquilino",
    rating: 4,
    title: "Buena atención",
    pros: "Resolvieron una avería en 48 horas.",
    cons: "La oficina cierra pronto y cuesta pillar a alguien por teléfono.",
    incidentTags: ["reparaciones"],
    moderated: true,
    flagged: false,
    wouldRecommend: true,
  }),
  demoReview({
    agencySlug: "gestion-urbana-madrid",
    role: "propietario",
    rating: 3,
    title: "Correcta",
    pros: "Cumplen con informes y liquidaciones.",
    cons: "Los informes mensuales son escuetos.",
    incidentTags: ["comunicacion"],
    moderated: true,
    flagged: false,
  }),
  demoReview({
    agencySlug: "pisos-barcelona",
    role: "inquilino",
    rating: 5,
    title: "Muy profesionales",
    pros: "Contrato claro y devolución de fianza sin problemas.",
    cons: "Poca flexibilidad con la fecha de entrada.",
    incidentTags: ["fianza"],
    moderated: true,
    flagged: false,
    wouldRecommend: true,
  }),
  demoReview({
    agencySlug: "inmobiliaria-javier-valencia",
    role: "inquilino",
    rating: 1,
    title: "Mala experiencia",
    pros: "El piso coincidía con lo anunciado.",
    cons: "No respondían a los correos durante el alquiler.",
    incidentTags: ["comunicacion"],
    moderated: true,
    flagged: false,
    wouldRecommend: false,
  }),
  demoReview({
    agencySlug: "inmobiliaria-javier-valencia",
    role: "propietario",
    rating: 4,
    title: "Buena gestión",
    pros: "Seleccionan inquilinos solventes y mantienen el piso en orden.",
    cons: "Las renovaciones se negocian con prisas.",
    incidentTags: ["renovacion"],
    moderated: true,
    flagged: false,
    wouldRecommend: true,
  }),
];

export function createDemoUserId() {
  return randomUUID();
}
