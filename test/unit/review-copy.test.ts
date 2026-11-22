import { describe, expect, it } from "vitest";

import {
  composeRelatoBody,
  composeReviewBody,
  NARRATIVE_MIN_LENGTH,
  narrativeLengthError,
  reviewPublicCopy,
} from "@/lib/domain/review-copy";
import { activeReviewForAgency } from "@/lib/domain/review-limits";

const NARRATIVE = "Tardaron tres semanas en devolver la fianza del piso.";
const PROS = "Devolvieron la fianza en el plazo acordado.";
const CONS = "Tardaron en contestar los correos de la avería.";

describe("review format", () => {
  it("shows a relato once, even when both sides are filled", () => {
    const copy = reviewPublicCopy({
      title: NARRATIVE,
      body: composeRelatoBody(NARRATIVE),
      pros: PROS,
      cons: CONS,
    });
    expect(copy.format).toBe("relato");
    expect(copy.title).toBeUndefined();
    expect(copy.narrative).toBe(NARRATIVE);
    expect(copy.pros).toBe(PROS);
    expect(copy.cons).toBe(CONS);
  });

  it("keeps the title of a structured review whose body matches both sides", () => {
    const copy = reviewPublicCopy({
      title: "La fianza volvió tarde",
      body: composeReviewBody(PROS, CONS),
      pros: PROS,
      cons: CONS,
    });
    expect(copy).toMatchObject({
      format: "structured",
      title: "La fianza volvió tarde",
      pros: PROS,
      cons: CONS,
    });
    expect(copy.narrative).toBeUndefined();
  });

  it("does not treat a body that only starts with Ventajas as the old format", () => {
    const body = "Ventajas: el portal estaba bien.\n\nLuego tardaron con la fianza.";
    const copy = reviewPublicCopy({
      title: "Fianza",
      body,
      pros: PROS,
      cons: CONS,
    });
    expect(copy.format).toBe("prose");
    expect(copy.title).toBe("Fianza");
    expect(copy.prose).toBe(body);
  });

  it("keeps a title on a prose review that has no sides", () => {
    const copy = reviewPublicCopy({
      title: "Visita en Chamberí",
      body: "El piso no coincidía con el anuncio y tardaron en decirlo.",
    });
    expect(copy.format).toBe("prose");
    expect(copy.title).toBe("Visita en Chamberí");
  });

  it("asks for one concrete sentence and refuses a fragment", () => {
    expect(narrativeLengthError("Muy corta")).toMatch(/40/);
    expect(narrativeLengthError("a".repeat(NARRATIVE_MIN_LENGTH - 1))).toBeTruthy();
    expect(narrativeLengthError(NARRATIVE)).toBeNull();
    expect(narrativeLengthError("a".repeat(901))).toMatch(/900/);
  });
});

describe("one review per agency", () => {
  it("finds the active review of this account for this ficha", () => {
    const reviews = [
      { agency: { slug: "otra" }, moderated: true, flagged: false },
      { agency: { slug: "sol" }, moderated: false, flagged: false },
    ];
    expect(activeReviewForAgency(reviews, "sol")?.moderated).toBe(false);
    expect(activeReviewForAgency(reviews, "ninguna")).toBeUndefined();
  });
});
