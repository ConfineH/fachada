import { randomUUID } from "node:crypto";

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

export const DEMO_REVIEWS: SeedReview[] = [
  {
    agencySlug: "inmobiliaria-sol-madrid",
    role: "inquilino",
    rating: 2,
    title: "Lenta en reparaciones",
    body: "Tardaron semanas en enviar al fontanero y la comunicación fue escasa.",
    incidentTags: ["reparaciones", "comunicacion"],
    moderated: true,
    flagged: false,
  },
  {
    agencySlug: "inmobiliaria-sol-madrid",
    role: "propietario",
    rating: 5,
    title: "Cobros puntuales",
    body: "Siempre ingresan el alquiler a tiempo y avisan de cualquier incidencia.",
    incidentTags: ["comunicacion"],
    moderated: true,
    flagged: false,
  },
  {
    agencySlug: "gestion-urbana-madrid",
    role: "inquilino",
    rating: 4,
    title: "Buena atención",
    body: "Resolvieron una avería en 48 horas.",
    incidentTags: ["reparaciones"],
    moderated: true,
    flagged: false,
  },
  {
    agencySlug: "gestion-urbana-madrid",
    role: "propietario",
    rating: 3,
    title: "Correcta",
    body: "Informes mensuales algo escuetos pero cumplen.",
    incidentTags: ["comunicacion"],
    moderated: true,
    flagged: false,
  },
  {
    agencySlug: "pisos-barcelona",
    role: "inquilino",
    rating: 5,
    title: "Muy profesionales",
    body: "Contrato claro y devolución de fianza sin problemas.",
    incidentTags: ["fianza"],
    moderated: true,
    flagged: false,
  },
  {
    agencySlug: "inmobiliaria-javier-valencia",
    role: "inquilino",
    rating: 1,
    title: "Mala experiencia",
    body: "No respondían a los correos durante el alquiler.",
    incidentTags: ["comunicacion"],
    moderated: true,
    flagged: false,
  },
  {
    agencySlug: "inmobiliaria-javier-valencia",
    role: "propietario",
    rating: 4,
    title: "Buena gestión",
    body: "Seleccionan inquilinos solventes y mantienen el piso en orden.",
    incidentTags: ["renovacion"],
    moderated: true,
    flagged: false,
  },
];

export function createDemoUserId() {
  return randomUUID();
}
