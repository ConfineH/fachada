import { normalizeAgencyName } from "@/lib/domain/match";

export function buildAgencySlug(name: string, city: string) {
  const slug = `${normalizeAgencyName(name)}-${normalizeAgencyName(city)}`
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return slug || "inmobiliaria";
}

export function ensureUniqueSlug(
  base: string,
  exists: (slug: string) => boolean,
) {
  if (!exists(base)) return base;
  for (let i = 2; i < 100; i++) {
    const candidate = `${base}-${i}`;
    if (!exists(candidate)) return candidate;
  }
  return `${base}-${Date.now()}`;
}
