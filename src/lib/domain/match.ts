export function normalizeAgencyName(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function matchScore(query: string, candidate: string) {
  const q = normalizeAgencyName(query);
  const c = normalizeAgencyName(candidate);
  if (!q || !c) return 0;
  if (q === c) return 1;
  if (c.includes(q) || q.includes(c)) return 0.85;
  const qTokens = new Set(q.split(" ").filter(Boolean));
  const cTokens = c.split(" ").filter(Boolean);
  if (cTokens.length === 0) return 0;
  const overlap = cTokens.filter((t) => qTokens.has(t)).length;
  return overlap / Math.max(qTokens.size, cTokens.length);
}

/** Containment and a full token overlap are a possible identity, not a merge. */
export const PROBABLE_MATCH_SCORE = 0.85;
/** Below this, the name is not offered as a hint. */
export const EXPLORATORY_MATCH_SCORE = 0.45;

export type MatchBand = "exact" | "probable" | "exploratory";

export function matchBand(query: string, candidate: string): MatchBand | null {
  const q = normalizeAgencyName(query);
  const c = normalizeAgencyName(candidate);
  if (!q || !c) return null;
  if (q === c) return "exact";
  const score = matchScore(query, candidate);
  if (score >= PROBABLE_MATCH_SCORE) return "probable";
  if (score >= EXPLORATORY_MATCH_SCORE) return "exploratory";
  return null;
}

export type MatchCandidate = {
  id: string;
  name: string;
  slug: string;
  city: string;
};

export type MatchAlias = {
  agencyId: string;
  alias: string;
};

export type CollectedMatch = {
  id: string;
  slug: string;
  name: string;
  city: string;
  confidence: number;
  band: MatchBand;
  matchedOn: string;
};

const BAND_RANK: Record<MatchBand, number> = {
  exact: 3,
  probable: 2,
  exploratory: 1,
};

/**
 * Every agency that clears the hint threshold. Exact and probable stay
 * together so a caller cannot keep only the highest score.
 */
export function collectAgencyMatches(
  query: string,
  agencies: MatchCandidate[],
  aliases: MatchAlias[],
  options?: { allowedIds?: Set<string> },
): { identified: CollectedMatch[]; hints: CollectedMatch[] } {
  const identified: CollectedMatch[] = [];
  const hints: CollectedMatch[] = [];
  const trimmed = query.trim();
  if (!trimmed) return { identified, hints };

  for (const agency of agencies) {
    if (options?.allowedIds && !options.allowedIds.has(agency.id)) continue;
    const names = [
      agency.name,
      ...aliases
        .filter((alias) => alias.agencyId === agency.id)
        .map((alias) => alias.alias),
    ];
    let best: CollectedMatch | null = null;
    for (const candidate of names) {
      const band = matchBand(trimmed, candidate);
      if (!band) continue;
      const confidence = matchScore(trimmed, candidate);
      const hit: CollectedMatch = {
        id: agency.id,
        slug: agency.slug,
        name: agency.name,
        city: agency.city,
        confidence,
        band,
        matchedOn: candidate,
      };
      if (
        !best ||
        BAND_RANK[hit.band] > BAND_RANK[best.band] ||
        (hit.band === best.band && hit.confidence > best.confidence)
      ) {
        best = hit;
      }
    }
    if (!best) continue;
    if (best.band === "exploratory") hints.push(best);
    else identified.push(best);
  }

  const byStrength = (a: CollectedMatch, b: CollectedMatch) =>
    BAND_RANK[b.band] - BAND_RANK[a.band] ||
    b.confidence - a.confidence ||
    a.name.localeCompare(b.name, "es");
  identified.sort(byStrength);
  hints.sort(byStrength);
  return { identified, hints };
}

export function agencyTextMatchesQuery(
  query: string,
  fields: Array<string | undefined>,
) {
  const needle = normalizeAgencyName(query);
  if (!needle) return true;
  return fields.some((field) => normalizeAgencyName(field ?? "").includes(needle));
}

export function nameIsCityLabel(name: string, city: string) {
  const label = normalizeAgencyName(name);
  return Boolean(label) && label === normalizeAgencyName(city);
}
