import { describe, expect, it } from "vitest";

import { summarizeRoleRatings } from "@/lib/domain/ratings";

describe("summarizeRoleRatings", () => {
  it("computes separate averages per role", () => {
    const stats = summarizeRoleRatings([
      { role: "inquilino", rating: 2 },
      { role: "inquilino", rating: 4 },
      { role: "propietario", rating: 5 },
    ]);

    expect(stats.inquilino.reviewCount).toBe(2);
    expect(stats.inquilino.averageRating).toBe(3);
    expect(stats.propietario.reviewCount).toBe(1);
    expect(stats.propietario.averageRating).toBe(5);
    expect(stats.overall.reviewCount).toBe(3);
  });
});
