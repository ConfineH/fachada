import { describe, expect, it } from "vitest";

import { mapOptionalSides, publicBodyFromSides } from "@/lib/preview/narrative";
import { reviewsForCityFilter } from "@/lib/preview/reviews";
import {
  provisionalCandidates,
  searchCurrent,
  searchProposed,
} from "@/lib/preview/search";
import { PREVIEW_REVIEWS } from "@/lib/preview/fixtures";

describe("preview alias search", () => {
  it("finds a commercial alias without opening a second ficha", () => {
    const current = searchCurrent("NorteLlaves");
    const proposed = searchProposed("NorteLlaves");

    expect(current).toHaveLength(0);
    expect(proposed.ambiguous).toBe(false);
    expect(proposed.hits.map((hit) => hit.agency.id)).toEqual(["norte"]);
    expect(proposed.hits[0]?.via).toBe("alias");
    expect(proposed.hits[0]?.matchedOn).toBe("NorteLlaves");
  });

  it("keeps similar names apart instead of merging them", () => {
    const proposed = searchProposed("Patio Sur");

    expect(proposed.ambiguous).toBe(true);
    expect(proposed.hits.map((hit) => hit.agency.id).sort()).toEqual(["patio", "sur"]);
  });

  it("asks to reject every candidate before a provisional ficha", () => {
    expect(provisionalCandidates("Alba Pisos").map((hit) => hit.agency.id)).toEqual(["alba"]);
    expect(provisionalCandidates("Zzz Inmobiliaria")).toHaveLength(0);
    expect(provisionalCandidates("Patio Sur").length).toBeGreaterThan(1);
  });
});

describe("preview reviews without a city", () => {
  it("keeps them in the full list and out of a city filter", () => {
    const sur = PREVIEW_REVIEWS.filter((review) => review.agencyId === "sur");
    const all = reviewsForCityFilter(sur, null);
    const madrid = reviewsForCityFilter(sur, "Madrid");

    expect(all.visible).toHaveLength(4);
    expect(all.omittedWithoutCity).toBe(0);
    expect(madrid.visible.every((review) => review.experienceCity === "Madrid")).toBe(true);
    expect(madrid.omittedWithoutCity).toBe(1);
    expect(madrid.visible.some((review) => review.experienceCity === null)).toBe(false);
  });
});

describe("preview narrative mapping", () => {
  it("stores one side and leaves the other empty", () => {
    const mapped = mapOptionalSides({
      pros: "",
      cons: "La fianza tardó más de un mes en volver.",
    });

    expect(mapped.publishable).toBe(true);
    expect(mapped.inventedText).toBe(false);
    expect(mapped.pros).toBe("");
    expect(mapped.omittedSide).toBe("pros");
    expect(publicBodyFromSides(mapped)).toBe(
      "Desventajas: La fianza tardó más de un mes en volver.",
    );
    expect(publicBodyFromSides(mapped)).not.toContain("Ventajas:");
  });

  it("does not publish a half-written side", () => {
    const mapped = mapOptionalSides({ pros: "Bien", cons: "" });
    expect(mapped.publishable).toBe(false);
    expect(mapped.pros).toBe("Bien");
  });
});
