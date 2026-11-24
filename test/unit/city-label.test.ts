import { describe, expect, it } from "vitest";

import { labelForCitySlug } from "@/lib/domain/city";

describe("city labels", () => {
  it("uses the matching city name instead of the first agency city", () => {
    expect(labelForCitySlug("barcelona", ["Madrid", "Barcelona"])).toBe(
      "Barcelona",
    );
  });

  it("keeps the accent from the stored city name", () => {
    expect(labelForCitySlug("malaga", ["Málaga"])).toBe("Málaga");
  });

  it("falls back to the slug when no stored name matches", () => {
    expect(labelForCitySlug("sevilla", ["Madrid"])).toBe("Sevilla");
  });
});
