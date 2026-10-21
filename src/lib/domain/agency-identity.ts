import { normalizeAgencyName } from "@/lib/domain/match";

/** Nombre + ciudad: minúsculas, sin acentos y con espacios colapsados. */
export function agencyPlaceKey(name: string, city: string) {
  return `${normalizeAgencyName(name)}|${normalizeAgencyName(city)}`;
}
