import { describe, expect, it } from "vitest";

import { matchScore, normalizeAgencyName } from "@/lib/domain/match";

describe("agency name match", () => {
  it("normalizes accents and casing", () => {
    expect(normalizeAgencyName("Inmobiliaría JAVIER")).toBe("inmobiliaria javier");
  });

  it("scores exact and partial matches", () => {
    expect(matchScore("Inmobiliaria Javier", "Inmobiliaria Javier")).toBe(1);
    expect(
      matchScore("Javier Madrid", "Inmobiliaria Javier"),
    ).toBeGreaterThanOrEqual(0.5);
  });
});
