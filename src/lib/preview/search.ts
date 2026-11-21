import { matchScore } from "@/lib/domain/match";

import {
  PREVIEW_AGENCIES,
  PREVIEW_REVIEWS,
  type PreviewAgency,
  type PreviewReview,
} from "@/lib/preview/fixtures";

/** Same floor as matchByName. Two agencies at or above it stay apart. */
export const PREVIEW_MATCH_THRESHOLD = 0.45;

export type PreviewSort = "reviews" | "inquilino" | "propietario" | "overall" | "name";

export type PreviewHit = {
  agency: PreviewAgency;
  matchedOn: string;
  via: "nombre" | "alias" | "ciudad";
  confidence: number;
};

export function reviewsOf(agencyId: string, reviews = PREVIEW_REVIEWS) {
  return reviews.filter((review) => review.agencyId === agencyId);
}

export function countByRole(reviews: PreviewReview[], role: PreviewReview["role"]) {
  return reviews.filter((review) => review.role === role).length;
}

function bestIdentity(agency: PreviewAgency, query: string): PreviewHit | null {
  const candidates: PreviewHit[] = [
    { agency, matchedOn: agency.name, via: "nombre", confidence: matchScore(query, agency.name) },
    ...agency.aliases.map((alias) => ({
      agency,
      matchedOn: alias,
      via: "alias" as const,
      confidence: matchScore(query, alias),
    })),
  ];
  return candidates.reduce<PreviewHit | null>(
    (best, hit) => (!best || hit.confidence > best.confidence ? hit : best),
    null,
  );
}

function servesCity(agency: PreviewAgency, query: string) {
  const needle = query.trim().toLocaleLowerCase("es");
  if (needle.length < 2) return false;
  return agency.cities.some((city) => city.toLocaleLowerCase("es").includes(needle));
}

export function searchProposed(
  query: string,
  agencies = PREVIEW_AGENCIES,
): { hits: PreviewHit[]; ambiguous: boolean } {
  const trimmed = query.trim();
  if (!trimmed) {
    return {
      hits: agencies.map((agency) => ({
        agency,
        matchedOn: agency.name,
        via: "nombre" as const,
        confidence: 1,
      })),
      ambiguous: false,
    };
  }

  const identity = agencies
    .map((agency) => bestIdentity(agency, trimmed))
    .filter((hit): hit is PreviewHit => hit !== null && hit.confidence >= PREVIEW_MATCH_THRESHOLD)
    .sort((a, b) => b.confidence - a.confidence || a.agency.name.localeCompare(b.agency.name, "es"));

  if (identity.length > 1) return { hits: identity, ambiguous: true };
  if (identity.length === 1) return { hits: identity, ambiguous: false };

  const byCity = agencies
    .filter((agency) => servesCity(agency, trimmed))
    .map((agency) => ({
      agency,
      matchedOn: agency.cities.find((city) =>
        city.toLocaleLowerCase("es").includes(trimmed.toLocaleLowerCase("es")),
      ) ?? agency.cities[0]!,
      via: "ciudad" as const,
      confidence: 1,
    }));
  return { hits: byCity, ambiguous: false };
}

/** What the public directory does today: name and city only, aliases ignored. */
export function searchCurrent(query: string, agencies = PREVIEW_AGENCIES): PreviewAgency[] {
  const needle = query.trim().toLocaleLowerCase("es");
  if (!needle) return [...agencies];
  return agencies.filter(
    (agency) =>
      agency.name.toLocaleLowerCase("es").includes(needle) ||
      agency.cities.some((city) => city.toLocaleLowerCase("es").includes(needle)),
  );
}

export function provisionalCandidates(query: string, agencies = PREVIEW_AGENCIES) {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];
  return searchProposed(trimmed, agencies).hits;
}

export function sortAgencies(
  agencies: PreviewAgency[],
  sort: PreviewSort,
  reviews = PREVIEW_REVIEWS,
) {
  const score = (agency: PreviewAgency, role?: PreviewReview["role"]) => {
    const own = reviewsOf(agency.id, reviews).filter((review) => !role || review.role === role);
    const count = own.length;
    const average = count === 0 ? 0 : own.reduce((sum, review) => sum + review.rating, 0) / count;
    return { count, average };
  };

  return [...agencies].sort((a, b) => {
    if (sort === "name") return a.name.localeCompare(b.name, "es");
    const role = sort === "inquilino" || sort === "propietario" ? sort : undefined;
    const left = score(a, role);
    const right = score(b, role);
    if (sort === "reviews") {
      const allA = reviewsOf(a.id, reviews).length;
      const allB = reviewsOf(b.id, reviews).length;
      if (allB !== allA) return allB - allA;
      return a.name.localeCompare(b.name, "es");
    }
    if (left.count === 0 && right.count === 0) return a.name.localeCompare(b.name, "es");
    if (left.count === 0) return 1;
    if (right.count === 0) return -1;
    if (right.average !== left.average) return right.average - left.average;
    if (right.count !== left.count) return right.count - left.count;
    return a.name.localeCompare(b.name, "es");
  });
}
