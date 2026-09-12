import {
  INCIDENT_TAG_LABELS,
  type IncidentTag,
} from "@/lib/domain/incidents";
import { reviewProsCons } from "@/lib/domain/review-copy";

export type ReviewPattern = {
  text: string;
  count: number;
  kind: "positive" | "negative";
};

export type ReviewPatternSummary = {
  positives: ReviewPattern[];
  negatives: ReviewPattern[];
  reviewCount: number;
};

const STOPWORDS = new Set(
  [
    "el",
    "la",
    "los",
    "las",
    "un",
    "una",
    "unos",
    "unas",
    "de",
    "del",
    "y",
    "o",
    "u",
    "a",
    "al",
    "en",
    "con",
    "por",
    "para",
    "que",
    "se",
    "su",
    "sus",
    "lo",
    "le",
    "les",
    "me",
    "te",
    "nos",
    "es",
    "son",
    "era",
    "fue",
    "muy",
    "mas",
    "más",
    "ya",
    "no",
    "si",
    "sí",
    "como",
    "cuando",
    "donde",
    "cual",
    "esta",
    "este",
    "esto",
    "hay",
    "tiene",
    "tienen",
    "hacer",
    "hace",
    "hizo",
    "poco",
    "poca",
    "algo",
    "cualquier",
  ].map((word) => word.normalize("NFD").replace(/\p{M}/gu, "")),
);

type PatternReview = {
  rating: number;
  pros?: string;
  cons?: string;
  body: string;
  incidentTags: IncidentTag[];
  wouldRecommend?: boolean;
};

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9ñ ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokens(value: string) {
  return new Set(
    normalize(value)
      .split(" ")
      .filter((token) => token.length > 2 && !STOPWORDS.has(token)),
  );
}

function overlapScore(a: Set<string>, b: Set<string>) {
  if (a.size === 0 || b.size === 0) return 0;
  let overlap = 0;
  for (const token of a) {
    if (b.has(token)) overlap += 1;
  }
  return overlap / Math.max(a.size, b.size);
}

function splitSnippets(text: string | undefined) {
  if (!text?.trim()) return [];
  return text
    .split(/[.!?…;]+/)
    .map((part) => part.trim().replace(/^[-–—]\s*/, ""))
    .filter((part) => part.length >= 18 && part.length <= 140);
}

function clusterSnippets(texts: string[], limit: number): ReviewPattern[] {
  const items = texts.map((text) => ({ text, tokens: tokens(text) }));
  const used = new Set<number>();
  const clusters: ReviewPattern[] = [];

  for (let i = 0; i < items.length; i++) {
    if (used.has(i)) continue;
    const members = [i];
    for (let j = i + 1; j < items.length; j++) {
      if (used.has(j)) continue;
      if (overlapScore(items[i]!.tokens, items[j]!.tokens) >= 0.4) {
        members.push(j);
        used.add(j);
      }
    }
    used.add(i);
    if (members.length < 2) continue;
    const shortest = members
      .map((index) => items[index]!.text)
      .sort((a, b) => a.length - b.length)[0]!;
    clusters.push({
      text: shortest,
      count: members.length,
      kind: "positive",
    });
  }

  return clusters
    .sort((a, b) => b.count - a.count || a.text.localeCompare(b.text, "es"))
    .slice(0, limit);
}

function takeUnique(items: ReviewPattern[], limit: number) {
  const seen = new Set<string>();
  const result: ReviewPattern[] = [];
  for (const item of items) {
    const key = normalize(item.text);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(item);
    if (result.length === limit) break;
  }
  return result;
}

export function summarizeReviewPatterns(
  reviews: PatternReview[],
): ReviewPatternSummary {
  const reviewCount = reviews.length;
  if (reviewCount < 2) {
    return { positives: [], negatives: [], reviewCount };
  }

  const tagCounts = new Map<IncidentTag, number>();
  let recommendCount = 0;
  const pros: string[] = [];
  const cons: string[] = [];

  for (const review of reviews) {
    if (review.wouldRecommend) recommendCount += 1;
    const parts = reviewProsCons(review);
    pros.push(...splitSnippets(parts.pros));
    cons.push(...splitSnippets(parts.cons));
    for (const tag of review.incidentTags) {
      if (tag === "otros") continue;
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
    }
  }

  const positives: ReviewPattern[] = [];
  if (recommendCount >= 2) {
    positives.push({
      text: `${recommendCount} de ${reviewCount} experiencias recomendarían tratar con ellos`,
      count: recommendCount,
      kind: "positive",
    });
  }
  positives.push(
    ...clusterSnippets(pros, 3).map((item) => ({ ...item, kind: "positive" as const })),
  );

  const negatives: ReviewPattern[] = [...tagCounts.entries()]
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 3)
    .map(([tag, count]) => ({
      text: INCIDENT_TAG_LABELS[tag],
      count,
      kind: "negative" as const,
    }));
  negatives.push(
    ...clusterSnippets(cons, 3).map((item) => ({ ...item, kind: "negative" as const })),
  );

  return {
    positives: takeUnique(positives, 3),
    negatives: takeUnique(negatives, 3),
    reviewCount,
  };
}
