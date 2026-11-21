import { matchScore, normalizeAgencyName } from "@/lib/domain/match";

import {
  PREVIEW_AGENCIES,
  PREVIEW_REVIEWS,
  type PreviewAgency,
  type PreviewReview,
} from "@/lib/preview/fixtures";

/** Hint floor only. A score here is not an identification. */
export const PREVIEW_MATCH_THRESHOLD = 0.45;
/** Containment band from matchScore. Still requires a person to choose. */
export const PREVIEW_PROBABLE_THRESHOLD = 0.85;

export type PreviewSort = "reviews" | "inquilino" | "propietario" | "overall" | "name";
export type MatchBand = "exacta" | "probable" | "exploratoria" | "ciudad";

export type PreviewHit = {
  agency: PreviewAgency;
  matchedOn: string;
  via: "nombre" | "alias" | "ciudad";
  confidence: number;
  band: MatchBand;
};

export type ProposedSearchResult = {
  identified: PreviewHit[];
  hints: PreviewHit[];
  cityHits: PreviewHit[];
  ambiguous: boolean;
};

export function reviewsOf(agencyId: string, reviews = PREVIEW_REVIEWS) {
  return reviews.filter((review) => review.agencyId === agencyId);
}

export function countByRole(reviews: PreviewReview[], role: PreviewReview["role"]) {
  return reviews.filter((review) => review.role === role).length;
}

export function matchBand(query: string, candidate: string, confidence: number): MatchBand | null {
  if (confidence <= 0) return null;
  if (normalizeAgencyName(query) === normalizeAgencyName(candidate)) return "exacta";
  if (confidence >= PREVIEW_PROBABLE_THRESHOLD) return "probable";
  if (confidence >= PREVIEW_MATCH_THRESHOLD) return "exploratoria";
  return null;
}

function bestIdentity(agency: PreviewAgency, query: string): PreviewHit | null {
  const candidates = [
    { matchedOn: agency.name, via: "nombre" as const },
    ...agency.aliases.map((alias) => ({ matchedOn: alias, via: "alias" as const })),
  ];
  let best: PreviewHit | null = null;
  for (const candidate of candidates) {
    const confidence = matchScore(query, candidate.matchedOn);
    const band = matchBand(query, candidate.matchedOn, confidence);
    if (!band || band === "ciudad") continue;
    const hit: PreviewHit = { agency, ...candidate, confidence, band };
    if (!best || rank(hit) > rank(best)) best = hit;
  }
  return best;
}

function rank(hit: PreviewHit) {
  const bandRank = hit.band === "exacta" ? 3 : hit.band === "probable" ? 2 : 1;
  return bandRank * 10 + hit.confidence;
}

function servesCity(agency: PreviewAgency, query: string) {
  const needle = query.trim().toLocaleLowerCase("es");
  if (needle.length < 2) return false;
  return agency.cities.some((city) => city.toLocaleLowerCase("es").includes(needle));
}

export function searchProposed(
  query: string,
  agencies = PREVIEW_AGENCIES,
): ProposedSearchResult {
  const trimmed = query.trim();
  if (!trimmed) {
    return { identified: [], hints: [], cityHits: [], ambiguous: false };
  }

  const ranked = agencies
    .map((agency) => bestIdentity(agency, trimmed))
    .filter((hit): hit is PreviewHit => hit !== null)
    .sort((a, b) => rank(b) - rank(a) || a.agency.name.localeCompare(b.agency.name, "es"));
  const identified = ranked.filter((hit) => hit.band === "exacta" || hit.band === "probable");
  const hints = ranked.filter((hit) => hit.band === "exploratoria");
  if (identified.length > 0) {
    return { identified, hints: [], cityHits: [], ambiguous: identified.length > 1 };
  }

  const cityHits = agencies
    .filter((agency) => servesCity(agency, trimmed))
    .map((agency) => ({
      agency,
      matchedOn:
        agency.cities.find((city) =>
          city.toLocaleLowerCase("es").includes(trimmed.toLocaleLowerCase("es")),
        ) ?? agency.cities[0]!,
      via: "ciudad" as const,
      confidence: 1,
      band: "ciudad" as const,
    }));
  return { identified, hints, cityHits, ambiguous: false };
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

export function provisionalAssessment(query: string, agencies = PREVIEW_AGENCIES) {
  const trimmed = query.trim();
  const cityNameOnly = agencies.some((agency) =>
    agency.cities.some((city) => city.toLocaleLowerCase("es") === trimmed.toLocaleLowerCase("es")),
  );
  if (trimmed.length < 2) {
    return {
      identified: [] as PreviewHit[],
      hints: [] as PreviewHit[],
      cityHits: [] as PreviewHit[],
      ambiguous: false,
      blocksNewFicha: false,
      cityNameOnly,
    };
  }
  const result = searchProposed(trimmed, agencies);
  return {
    ...result,
    blocksNewFicha: result.identified.length > 0,
    cityNameOnly,
  };
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
