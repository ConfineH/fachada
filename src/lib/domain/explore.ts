import { cityToSlug } from "@/lib/domain/city";
import type { AgencyRoleRatings } from "@/lib/domain/ratings";
import type { CityExploreSummary } from "@/lib/services/agency-service";

export function averageRatingForCity(
  agencies: Array<{ city: string; roleRatings: AgencyRoleRatings }>,
  citySlug: string,
): number | null {
  const inCity = agencies.filter((a) => cityToSlug(a.city) === citySlug);
  if (inCity.length === 0) return null;

  let weighted = 0;
  let count = 0;
  for (const agency of inCity) {
    const { overall } = agency.roleRatings;
    weighted += overall.averageRating * overall.reviewCount;
    count += overall.reviewCount;
  }
  if (count === 0) return null;
  return weighted / count;
}

export function groupCitiesByLetter(cities: CityExploreSummary[]) {
  const groups = new Map<string, CityExploreSummary[]>();
  for (const city of cities) {
    const letter = city.city.charAt(0).toLocaleUpperCase("es");
    const bucket = groups.get(letter) ?? [];
    bucket.push(city);
    groups.set(letter, bucket);
  }
  return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b, "es"));
}

export function scoreTone(
  average: number | null,
): "positive" | "neutral" | "caution" {
  if (average === null) return "neutral";
  if (average >= 4) return "positive";
  if (average >= 3) return "neutral";
  return "caution";
}
