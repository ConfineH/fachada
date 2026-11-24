import { describe, expect, it } from "vitest";

import { draftReady, mapNarrative, mapOptionalSides, publicBodyFromSides } from "@/lib/preview/narrative";
import { reviewsForCityFilter } from "@/lib/preview/reviews";
import { provisionalAssessment, searchCurrent, searchProposed } from "@/lib/preview/search";
import { PREVIEW_REVIEWS } from "@/lib/preview/fixtures";

describe("preview alias search", () => {
  it("finds an exact alias and still requires a choice", () => {
    const current = searchCurrent("NorteLlaves");
    const proposed = searchProposed("NorteLlaves");
    const gate = provisionalAssessment("NorteLlaves");

    expect(current).toHaveLength(0);
    expect(proposed.ambiguous).toBe(false);
    expect(proposed.identified.map((hit) => hit.agency.id)).toEqual(["norte"]);
    expect(proposed.identified[0]?.band).toBe("exacta");
    expect(proposed.hints).toHaveLength(0);
    expect(gate.blocksNewFicha).toBe(true);
  });

  it("keeps similar names apart instead of merging them", () => {
    const proposed = searchProposed("Patio Sur");
    const gate = provisionalAssessment("Patio Sur");

    expect(proposed.ambiguous).toBe(true);
    expect(proposed.identified.map((hit) => hit.agency.id).sort()).toEqual(["patio", "sur"]);
    expect(proposed.identified.every((hit) => hit.band === "exacta" || hit.band === "probable")).toBe(true);
    expect(gate.blocksNewFicha).toBe(true);
  });

  it("treats 0.45 as a hint and leaves an unknown name free to continue", () => {
    const hinted = provisionalAssessment("Gestión Ejemplo");
    const unknown = provisionalAssessment("Zzz Inmobiliaria");
    const city = provisionalAssessment("Madrid");

    expect(hinted.identified).toHaveLength(0);
    expect(hinted.hints.map((hit) => hit.agency.id)).toEqual(["alba"]);
    expect(hinted.hints[0]?.band).toBe("exploratoria");
    expect(hinted.blocksNewFicha).toBe(false);
    expect(unknown.identified).toHaveLength(0);
    expect(unknown.hints).toHaveLength(0);
    expect(unknown.blocksNewFicha).toBe(false);
    expect(city.cityNameOnly).toBe(true);
    expect(city.cityHits.length).toBeGreaterThan(0);
    expect(city.blocksNewFicha).toBe(false);
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

  it("keeps the narrative in the body and optional sides in their fields", () => {
    const mapped = mapNarrative({
      narrative: "La fianza tardó más de un mes en volver a la cuenta.",
      pros: "",
      cons: "",
      incidentTags: ["fianza"],
    });

    expect(mapped.publishable).toBe(true);
    expect(mapped.inventedText).toBe(false);
    expect(mapped.pros).toBe("");
    expect(mapped.cons).toBe("");
    expect(mapped.body).toBe("La fianza tardó más de un mes en volver a la cuenta.");
    expect(mapped.body).not.toContain("Ventajas:");
    expect(mapped.incidentTags).toEqual(["fianza"]);
    expect(mapped.title.length).toBeGreaterThan(0);
    expect(mapped.title.length).toBeLessThanOrEqual(100);
  });

  it("does not publish a half-written optional side", () => {
    const mapped = mapNarrative({
      narrative: "La fianza tardó más de un mes en volver a la cuenta.",
      pros: "Bien",
      cons: "",
    });
    expect(mapped.publishable).toBe(false);
    expect(mapped.pros).toBe("Bien");
  });
});

describe("preview publish gate", () => {
  const narrative = "La fianza tardó más de un mes en volver a la cuenta.";

  it("blocks the ending until the calculated conditions are met", () => {
    expect(
      draftReady({
        mode: "narrativa",
        narrative,
        pros: "",
        cons: "",
        rating: null,
        declarationsAccepted: 0,
      }).ready,
    ).toBe(false);
    expect(
      draftReady({
        mode: "narrativa",
        narrative,
        pros: "",
        cons: "",
        rating: 4,
        declarationsAccepted: 4,
      }).ready,
    ).toBe(true);
    expect(
      draftReady({
        mode: "conservador",
        narrative: "",
        pros: narrative,
        cons: "",
        rating: 4,
        declarationsAccepted: 4,
      }).ready,
    ).toBe(false);
  });
});
