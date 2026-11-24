export const PREVIEW_NOTICE =
  "Datos ficticios de esta preview. No son fichas, alias ni reseñas de producción.";

export type PreviewRole = "inquilino" | "propietario";

export type PreviewReview = {
  id: string;
  agencyId: string;
  role: PreviewRole;
  rating: number;
  title: string;
  body: string;
  experienceCity: string | null;
  experienceType: string;
  createdLabel: string;
};

export type PreviewAgency = {
  id: string;
  name: string;
  legalName: string;
  cities: string[];
  aliases: string[];
};

export const PREVIEW_AGENCIES: PreviewAgency[] = [
  {
    id: "alba",
    name: "Alba Gestión",
    legalName: "Alba Gestión Ejemplo SL",
    cities: ["Madrid"],
    aliases: ["Alba Pisos", "Alba Gestión Chamberí"],
  },
  {
    id: "norte",
    name: "Norte Llaves",
    legalName: "Norte Llaves Ejemplo SL",
    cities: ["Madrid"],
    aliases: ["NorteLlaves", "Norte Llaves Chamberí"],
  },
  {
    id: "sur",
    name: "Sur Patio",
    legalName: "Sur Patio Ejemplo SL",
    cities: ["Madrid", "Sevilla"],
    aliases: ["SurPatio", "Sur Patio Salamanca"],
  },
  {
    id: "patio",
    name: "Patio Sur Gestión",
    legalName: "Patio Sur Gestión Ejemplo SL",
    cities: ["Barcelona"],
    aliases: ["Patio Sur"],
  },
];

export const PREVIEW_REVIEWS: PreviewReview[] = [
  {
    id: "r-norte-1",
    agencyId: "norte",
    role: "inquilino",
    rating: 4,
    title: "El contrato llegó; la fianza, más tarde",
    body: "Ejemplo ficticio. Firmé en Chamberí y la fianza volvió al mes, no a la semana.",
    experienceCity: "Madrid",
    experienceType: "Alquiler",
    createdLabel: "mar 2026",
  },
  {
    id: "r-sur-1",
    agencyId: "sur",
    role: "inquilino",
    rating: 2,
    title: "La gotera esperó tres semanas",
    body: "Ejemplo ficticio. Avisé por escrito y la reparación tardó tres semanas.",
    experienceCity: "Madrid",
    experienceType: "Incidencia",
    createdLabel: "ene 2026",
  },
  {
    id: "r-sur-2",
    agencyId: "sur",
    role: "propietario",
    rating: 5,
    title: "Las cuentas llegaban cada mes",
    body: "Ejemplo ficticio. Me enviaban el resumen y el seguro sin tener que perseguirlo.",
    experienceCity: "Sevilla",
    experienceType: "Gestión",
    createdLabel: "feb 2026",
  },
  {
    id: "r-sur-3",
    agencyId: "sur",
    role: "inquilino",
    rating: 3,
    title: "Visité el piso y no supe quién lo llevaba",
    body: "Ejemplo ficticio. Esta experiencia no tiene ciudad guardada. No hay que inventarla.",
    experienceCity: null,
    experienceType: "Visita",
    createdLabel: "sep 2026",
  },
  {
    id: "r-sur-4",
    agencyId: "sur",
    role: "propietario",
    rating: 4,
    title: "Renovaron y me avisaron del seguro",
    body: "Ejemplo ficticio. La renovación fue clara. El seguro lo explicaron antes de cobrarlo.",
    experienceCity: "Madrid",
    experienceType: "Gestión",
    createdLabel: "abr 2026",
  },
  {
    id: "r-patio-1",
    agencyId: "patio",
    role: "propietario",
    rating: 4,
    title: "Una sola gestión, en Barcelona",
    body: "Ejemplo ficticio. Es otra empresa, aunque el nombre se parece a Sur Patio.",
    experienceCity: "Barcelona",
    experienceType: "Gestión",
    createdLabel: "jun 2026",
  },
];

export type AccountStatus = "publicada" | "pendiente" | "retirada";

export type PreviewAccountItem = {
  id: string;
  agencyId: string;
  title: string;
  role: PreviewRole;
  rating: number;
  status: AccountStatus;
  experienceCity: string | null;
};

export const PREVIEW_ACCOUNT: PreviewAccountItem[] = [
  {
    id: "a1",
    agencyId: "norte",
    title: "El contrato llegó; la fianza, más tarde",
    role: "inquilino",
    rating: 4,
    status: "publicada",
    experienceCity: "Madrid",
  },
  {
    id: "a2",
    agencyId: "alba",
    title: "Primera visita, todavía sin publicar",
    role: "inquilino",
    rating: 3,
    status: "pendiente",
    experienceCity: "Madrid",
  },
  {
    id: "a3",
    agencyId: "sur",
    title: "Visité el piso y no supe quién lo llevaba",
    role: "inquilino",
    rating: 3,
    status: "publicada",
    experienceCity: null,
  },
  {
    id: "a4",
    agencyId: "patio",
    title: "Texto retirado tras un aviso",
    role: "propietario",
    rating: 1,
    status: "retirada",
    experienceCity: "Barcelona",
  },
];

export function agencyById(id: string) {
  const agency = PREVIEW_AGENCIES.find((item) => item.id === id);
  if (!agency) throw new Error(`Ficha ficticia desconocida: ${id}`);
  return agency;
}

export function reviewsForAgency(agencyId: string) {
  return PREVIEW_REVIEWS.filter((review) => review.agencyId === agencyId);
}
