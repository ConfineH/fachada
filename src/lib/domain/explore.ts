import type { CityExploreSummary } from "@/lib/services/agency-service";

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
