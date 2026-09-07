import { describe, expect, it } from "vitest";

import { parseIncidentTags } from "@/lib/domain/incidents";

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
