import { normalizeAgencyName } from "@/lib/domain/match";

export function cityToSlug(city: string) {
  return normalizeAgencyName(city).replace(/\s+/g, "-");
}

export function slugToCityLabel(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
