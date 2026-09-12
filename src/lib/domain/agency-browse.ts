import type { AgencyRoleRatings } from "@/lib/domain/ratings";
import type { AgencyWithStats } from "@/lib/domain/types";

export const AGENCY_SORTS = [
  "reviews",
  "inquilino",
  "propietario",
  "overall",
  "name",
] as const;

export type AgencySort = (typeof AGENCY_SORTS)[number];

export const AGENCY_SORT_OPTIONS: { id: AgencySort; label: string }[] = [
  { id: "reviews", label: "Más reseñas" },
  { id: "inquilino", label: "Inquilinos" },
  { id: "propietario", label: "Propietarios" },
  { id: "overall", label: "Nota general" },
  { id: "name", label: "Nombre" },
];

export const HOME_DOCUMENTED_LIMIT = 6;

const SORT_SET = new Set<string>(AGENCY_SORTS);

export function parseAgencySort(value: string | undefined | null): AgencySort {
  if (value && SORT_SET.has(value)) return value as AgencySort;
  return "reviews";
}

function lensOf(sort: AgencySort): keyof AgencyRoleRatings | null {
  if (sort === "inquilino" || sort === "propietario" || sort === "overall") {
    return sort;
  }
  return null;
}

export function sortAgencies(
  agencies: AgencyWithStats[],
  sort: AgencySort = "reviews",
): AgencyWithStats[] {
  return agencies.toSorted((a, b) => {
    if (sort === "name") {
      return a.name.localeCompare(b.name, "es");
    }

    if (sort === "reviews") {
      if (b.reviewCount !== a.reviewCount) return b.reviewCount - a.reviewCount;
      if (b.averageRating !== a.averageRating) {
        return b.averageRating - a.averageRating;
      }
      return a.name.localeCompare(b.name, "es");
    }

    const lens = lensOf(sort);
    if (!lens) return a.name.localeCompare(b.name, "es");

    const aCount = a.roleRatings[lens].reviewCount;
    const bCount = b.roleRatings[lens].reviewCount;
    if (aCount === 0 && bCount === 0) return a.name.localeCompare(b.name, "es");
    if (aCount === 0) return 1;
    if (bCount === 0) return -1;

    const aScore = a.roleRatings[lens].averageRating;
    const bScore = b.roleRatings[lens].averageRating;
    if (bScore !== aScore) return bScore - aScore;
    if (bCount !== aCount) return bCount - aCount;
    return a.name.localeCompare(b.name, "es");
  });
}

export function documentedAgencies(
  agencies: AgencyWithStats[],
  limit = HOME_DOCUMENTED_LIMIT,
) {
  return sortAgencies(
    agencies.filter((agency) => agency.reviewCount > 0),
    "reviews",
  ).slice(0, limit);
}
