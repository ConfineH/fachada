import {
  formatLocationLine,
  isConfirmedStreetAddress,
  publicStreetLine,
} from "@/lib/domain/agency-presence";
import { cityToSlug } from "@/lib/domain/city";
import { normalizeAgencyName } from "@/lib/domain/match";

export function companyKey(name: string) {
  return normalizeAgencyName(name);
}

export function brandSlugFromName(name: string) {
  return companyKey(name).replace(/\s+/g, "-");
}

export function presenceCities(
  agency: { city: string },
  locations: { city: string; status?: string }[],
) {
  const cities: string[] = [];
  const seen = new Set<string>();

  function add(city: string) {
    const trimmed = city.trim();
    if (!trimmed) return;
    const key = cityToSlug(trimmed);
    if (seen.has(key)) return;
    seen.add(key);
    cities.push(trimmed);
  }

  add(agency.city);
  for (const location of locations) {
    if (location.status && location.status !== "publicado") continue;
    add(location.city);
  }
  return cities;
}

export function servesCity(
  agency: { city: string },
  locations: { city: string; status?: string }[],
  city: string,
) {
  const target = cityToSlug(city);
  return presenceCities(agency, locations).some(
    (item) => cityToSlug(item) === target,
  );
}

export function formatCityList(cities: string[]) {
  if (cities.length <= 1) return cities[0] ?? "";
  if (cities.length === 2) return `${cities[0]} y ${cities[1]}`;
  return `${cities.slice(0, -1).join(", ")} y ${cities[cities.length - 1]}`;
}

export function publicPresenceLine(
  agency: { address: string; city: string; postalCode: string },
  cities: string[],
) {
  if (cities.length > 1) return formatCityList(cities);
  if (!isConfirmedStreetAddress(agency.address)) {
    return `Calle por confirmar · ${agency.city}`;
  }
  return publicStreetLine(agency);
}

export function distinctCifs(agencies: { cif?: string }[]) {
  return new Set(
    agencies
      .map((agency) => agency.cif?.replace(/\s/g, "").toUpperCase())
      .filter((cif): cif is string => Boolean(cif)),
  );
}

/** Nota de marca: varias fichas del mismo nombre y al menos dos CIF distintos. */
export function brandScoreApplies(agencies: { cif?: string }[]) {
  return agencies.length >= 2 && distinctCifs(agencies).size >= 2;
}

export function presenceGroups(
  agency: { address: string; city: string; postalCode: string },
  locations: {
    city: string;
    address: string;
    postalCode: string;
    status?: string;
    label?: string;
  }[],
) {
  const published = locations.filter(
    (location) => !location.status || location.status === "publicado",
  );
  return presenceCities(agency, published).map((city) => {
    const lines: string[] = [];
    if (cityToSlug(agency.city) === cityToSlug(city)) {
      lines.push(
        isConfirmedStreetAddress(agency.address)
          ? publicStreetLine(agency)
          : "Calle por confirmar",
      );
    }
    for (const location of published) {
      if (cityToSlug(location.city) !== cityToSlug(city)) continue;
      const text = isConfirmedStreetAddress(location.address)
        ? formatLocationLine(location)
        : "Calle por confirmar";
      if (!lines.includes(text)) lines.push(text);
    }
    if (lines.length === 0) lines.push("Calle por confirmar");
    return { city, lines };
  });
}
