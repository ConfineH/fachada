import { describe, expect, it } from "vitest";

import {
  documentedAgencies,
  parseAgencySort,
  sortAgencies,
} from "@/lib/domain/agency-browse";
import type { AgencyWithStats } from "@/lib/domain/types";

function agency(
  name: string,
  inquilino: { averageRating: number; reviewCount: number },
  propietario: { averageRating: number; reviewCount: number } = {
    averageRating: 0,
    reviewCount: 0,
  },
): AgencyWithStats {
  const overallCount = inquilino.reviewCount + propietario.reviewCount;
  const overallAvg =
    overallCount === 0
      ? 0
      : (inquilino.averageRating * inquilino.reviewCount +
          propietario.averageRating * propietario.reviewCount) /
        overallCount;
  return {
    id: name,
    slug: name,
    name,
    city: "Madrid",
    address: "Calle 1",
    postalCode: "28001",
    phone: "",
    email: "",
    verified: false,
    createdAt: new Date(),
    averageRating: overallAvg,
    reviewCount: overallCount,
    roleRatings: {
      inquilino,
      propietario,
      overall: { averageRating: overallAvg, reviewCount: overallCount },
    },
  } as AgencyWithStats;
}

describe("parseAgencySort", () => {
  it("defaults to reviews and ignores unknown values", () => {
    expect(parseAgencySort(undefined)).toBe("reviews");
    expect(parseAgencySort("nope")).toBe("reviews");
    expect(parseAgencySort("inquilino")).toBe("inquilino");
  });
});

describe("sortAgencies", () => {
  const sol = agency("Sol", { averageRating: 5, reviewCount: 1 });
  const urbana = agency("Urbana", { averageRating: 3, reviewCount: 4 });
  const vacia = agency("Vacía", { averageRating: 0, reviewCount: 0 });

  it("puts the most documented agencies first by default", () => {
    const sorted = sortAgencies([sol, urbana, vacia], "reviews");
    expect(sorted.map((item) => item.name)).toEqual(["Urbana", "Sol", "Vacía"]);
  });

  it("keeps unrated agencies last when sorting by a rating lens", () => {
    const sorted = sortAgencies([vacia, urbana, sol], "inquilino");
    expect(sorted.map((item) => item.name)).toEqual(["Sol", "Urbana", "Vacía"]);
  });
});

describe("documentedAgencies", () => {
  it("only returns fichas with published reviews", () => {
    const featured = documentedAgencies([
      agency("Vacía", { averageRating: 0, reviewCount: 0 }),
      agency("Sol", { averageRating: 2, reviewCount: 1 }),
      agency("Urbana", { averageRating: 4, reviewCount: 3 }),
    ]);
    expect(featured.map((item) => item.name)).toEqual(["Urbana", "Sol"]);
  });
});
