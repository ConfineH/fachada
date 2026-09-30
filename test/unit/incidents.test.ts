import { describe, expect, it } from "vitest";

import {
  parseIncidentSentiments,
  parseIncidentTags,
  summarizeIncidentSentiments,
  tagsFromSentiments,
  unsetMarkMessage,
} from "@/lib/domain/incidents";

describe("parseIncidentTags", () => {
  it("keeps unique allowed tags", () => {
    expect(
      parseIncidentTags(["fianza", "fianza", "honorarios_gestion", "nope"]),
    ).toEqual(["fianza", "honorarios_gestion"]);
  });

  it("returns empty for non-arrays", () => {
    expect(parseIncidentTags(null)).toEqual([]);
    expect(parseIncidentTags("fianza")).toEqual([]);
  });
});

describe("incident sentiments", () => {
  it("keeps only known tags marked bien or mal", () => {
    const parsed = parseIncidentSentiments({
      fianza: "negativa",
      comunicacion: "positiva",
      inventado: "positiva",
      reparaciones: "maybe",
    });
    expect(parsed).toEqual({
      fianza: "negativa",
      comunicacion: "positiva",
    });
    expect(tagsFromSentiments(parsed)).toEqual(["fianza", "comunicacion"]);
  });

  it("asks for bien or mal when a theme is checked and unmarked", () => {
    expect(unsetMarkMessage({ fianza: "unset" })).toMatch(/Fianza/);
    expect(unsetMarkMessage({ fianza: "negativa" })).toBeNull();
  });

  it("summarizes how often a theme went well", () => {
    const summary = summarizeIncidentSentiments([
      { incidentSentiments: { comunicacion: "positiva" } },
      { incidentSentiments: { comunicacion: "positiva" } },
      { incidentSentiments: { comunicacion: "negativa" } },
    ]);
    expect(summary).toEqual([
      {
        tag: "comunicacion",
        label: "Comunicación o respuesta",
        positiva: 2,
        negativa: 1,
      },
    ]);
  });
});
