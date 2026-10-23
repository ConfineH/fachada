import { describe, expect, it } from "vitest";

import {
  parseReviewOrigin,
  toolReviewOrigin,
  withReviewOrigin,
} from "@/lib/domain/review-origin";
import { summarizeReviewOrigins } from "@/lib/domain/review-funnel";

describe("review origin", () => {
  it("accepts the six calculators and drops anything else", () => {
    expect(parseReviewOrigin("desistimiento")).toBe("desistimiento");
    expect(parseReviewOrigin(" salida ")).toBeUndefined();
    expect(parseReviewOrigin("google")).toBeUndefined();
    expect(parseReviewOrigin("")).toBeUndefined();
    expect(parseReviewOrigin(null)).toBeUndefined();
  });

  it("maps each tool page to the short origin", () => {
    expect(toolReviewOrigin("honorarios")).toBe("honorarios");
    expect(toolReviewOrigin("fianza")).toBe("fianza");
    expect(toolReviewOrigin("reparaciones")).toBe("reparaciones");
    expect(toolReviewOrigin("salida-anticipada")).toBe("desistimiento");
    expect(toolReviewOrigin("acta-entrega-llaves")).toBe("acta");
    expect(toolReviewOrigin("subida-alquiler")).toBe("subida");
  });

  it("adds desde without dropping the search", () => {
    expect(withReviewOrigin("/agencias", "desistimiento")).toBe(
      "/agencias?desde=desistimiento",
    );
    expect(withReviewOrigin("/agencias?q=sol&orden=rating", "fianza")).toBe(
      "/agencias?q=sol&orden=rating&desde=fianza",
    );
    expect(withReviewOrigin("/agencias/sol", "no-existe")).toBe("/agencias/sol");
  });

  it("counts submitted and published reviews per calculator", () => {
    const rows = summarizeReviewOrigins([
      { agencyId: "a", moderated: true, flagged: false, origen: "desistimiento" },
      { agencyId: "a", moderated: false, flagged: false, origen: "desistimiento" },
      { agencyId: "b", moderated: true, flagged: false, origen: "fianza" },
      { agencyId: "c", moderated: true, flagged: true, origen: "fianza" },
      { agencyId: "d", moderated: true, flagged: false, origen: "google" },
      {
        agencyId: "e",
        moderated: true,
        flagged: false,
        origen: "acta",
        deletedAt: new Date(),
      },
    ]);
    expect(rows.find((row) => row.origen === "desistimiento")).toMatchObject({
      submitted: 2,
      published: 1,
    });
    expect(rows.find((row) => row.origen === "fianza")).toMatchObject({
      submitted: 2,
      published: 1,
    });
    expect(rows.find((row) => row.origen === "acta")).toMatchObject({
      submitted: 0,
      published: 0,
    });
    expect(rows).toHaveLength(6);
  });
});
