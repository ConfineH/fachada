import { describe, expect, it } from "vitest";

import {
  experienceCityLabel,
  reviewsForCityFilter,
} from "@/lib/domain/review-city";

const reviews = [
  { id: "madrid", experienceCity: "Madrid" },
  { id: "bare", experienceCity: "  " },
  { id: "missing", experienceCity: null },
  { id: "valencia", experienceCity: "Valencia" },
];

describe("reviews without a city", () => {
  it("keeps them in the full list and labels the gap", () => {
    const all = reviewsForCityFilter(reviews, null);
    expect(all.visible).toHaveLength(4);
    expect(all.omittedWithoutCity).toBe(0);
    expect(experienceCityLabel("")).toBe("Ciudad no indicada");
    expect(experienceCityLabel("Madrid")).toBe("Madrid");
  });

  it("drops them from a city filter and counts the omission", () => {
    const madrid = reviewsForCityFilter(reviews, "Madrid");
    expect(madrid.visible.map((review) => review.id)).toEqual(["madrid"]);
    expect(madrid.omittedWithoutCity).toBe(2);
  });
});
