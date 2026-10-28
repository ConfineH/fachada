import { describe, expect, it } from "vitest";

import {
  earliestExperienceIso,
  experienceDateError,
} from "@/lib/domain/review-authenticity";

function utc(year: number, month: number, day: number) {
  return new Date(Date.UTC(year, month - 1, day));
}

describe("experienceDateError", () => {
  const now = utc(2026, 10, 28);

  it("accepts today and the same day 36 months earlier", () => {
    expect(experienceDateError(utc(2026, 10, 28), now)).toBeNull();
    expect(experienceDateError(utc(2023, 10, 28), now)).toBeNull();
    expect(earliestExperienceIso(now)).toBe("2023-10-28");
  });

  it("rejects the day before that boundary and any future day", () => {
    expect(experienceDateError(utc(2023, 10, 27), now)).toMatch(/últimos 36 meses/);
    expect(experienceDateError(utc(2026, 10, 29), now)).toMatch(/no puede ser futura/);
  });

  it("keeps a date older than 30 days when it is still inside 36 months", () => {
    expect(experienceDateError(utc(2026, 9, 1), now)).toBeNull();
  });

  it("clamps 29 February to 28 February when the month 36 months earlier is not a leap year", () => {
    const leapDay = utc(2024, 2, 29);
    expect(earliestExperienceIso(leapDay)).toBe("2021-02-28");
    expect(experienceDateError(utc(2021, 2, 28), leapDay)).toBeNull();
    expect(experienceDateError(utc(2021, 2, 27), leapDay)).toMatch(
      /últimos 36 meses/,
    );
  });

  it("uses the calendar day, so the window is 1096 days when it contains a leap day and 1095 when it does not", () => {
    const withLeap = utc(2026, 10, 28);
    const withoutLeap = utc(2027, 10, 28);
    expect(earliestExperienceIso(withLeap)).toBe("2023-10-28");
    expect(earliestExperienceIso(withoutLeap)).toBe("2024-10-28");
    const dayMs = 24 * 60 * 60 * 1000;
    expect((withLeap.getTime() - utc(2023, 10, 28).getTime()) / dayMs).toBe(1096);
    expect((withoutLeap.getTime() - utc(2024, 10, 28).getTime()) / dayMs).toBe(1095);
  });

  it("rejects an invalid date", () => {
    expect(experienceDateError(new Date(Number.NaN), now)).toMatch(
      /última interacción/,
    );
  });
});
