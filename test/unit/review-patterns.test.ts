import { describe, expect, it } from "vitest";

import { summarizeReviewPatterns } from "@/lib/domain/review-patterns";

describe("summarizeReviewPatterns", () => {
  it("hides the summary until there are at least three reviews", () => {
    const summary = summarizeReviewPatterns([
      {
        rating: 2,
        pros: "El contrato estaba claro.",
        cons: "Tardaron semanas en enviar al fontanero.",
        body: "",
        incidentTags: ["reparaciones"],
        wouldRecommend: false,
      },
    ]);
    expect(summary.positives).toEqual([]);
    expect(summary.negatives).toEqual([]);
    const twoReviews = summarizeReviewPatterns([
      {
        rating: 2,
        pros: "El contrato estaba claro.",
        cons: "Tardaron semanas en enviar al fontanero.",
        body: "",
        incidentTags: ["reparaciones"],
        wouldRecommend: false,
      },
      {
        rating: 3,
        pros: "La visita fue puntual.",
        cons: "Tardaron semanas en enviar al fontanero.",
        body: "",
        incidentTags: ["reparaciones"],
        wouldRecommend: false,
      },
    ]);
    expect(twoReviews.positives).toEqual([]);
    expect(twoReviews.negatives).toEqual([]);
  });

  it("surfaces repeated incident tags and recommend count", () => {
    const summary = summarizeReviewPatterns([
      {
        rating: 2,
        pros: "El contrato estaba claro y el cobro de la renta era puntual.",
        cons: "Tardaron semanas en enviar al fontanero y la comunicación fue escasa.",
        body: "",
        incidentTags: ["reparaciones", "comunicacion"],
        wouldRecommend: false,
      },
      {
        rating: 5,
        pros: "Siempre ingresan el alquiler a tiempo y avisan de cualquier incidencia.",
        cons: "Poco margen para decidir proveedores de mantenimiento.",
        body: "",
        incidentTags: ["comunicacion"],
        wouldRecommend: true,
      },
      {
        rating: 4,
        pros: "Ingresan el alquiler a tiempo cada mes.",
        cons: "Cuesta que contesten el teléfono.",
        body: "",
        incidentTags: ["comunicacion"],
        wouldRecommend: true,
      },
    ]);

    expect(summary.negatives[0]).toMatchObject({
      text: "Comunicación o respuesta",
      count: 3,
    });
    expect(summary.positives.some((item) => item.text.includes("recomendarían"))).toBe(
      true,
    );
    expect(summary.positives.some((item) => /alquiler a tiempo/i.test(item.text))).toBe(
      true,
    );
  });
});
