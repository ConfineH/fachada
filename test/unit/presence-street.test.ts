import { describe, expect, it } from "vitest";

import { publicStreetLine } from "@/lib/domain/agency-presence";
import {
  presenceGroups,
  publicPresenceLine,
} from "@/lib/domain/company-presence";

const madrid = { address: "", city: "Madrid", postalCode: "" };

describe("missing street", () => {
  it("does not invent a street line", () => {
    expect(publicStreetLine(madrid)).toBe("");
    expect(publicPresenceLine(madrid, ["Madrid"])).toBe("Madrid");
    expect(presenceGroups(madrid, [])[0]?.lines).toEqual([]);
  });

  it("still shows a confirmed street", () => {
    const agency = {
      address: "Calle Mayor 12",
      city: "Madrid",
      postalCode: "28013",
    };
    expect(publicPresenceLine(agency, ["Madrid"])).toContain("Calle Mayor 12");
    expect(presenceGroups(agency, [])[0]?.lines[0]).toContain("Calle Mayor 12");
  });
});
