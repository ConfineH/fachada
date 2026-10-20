import { describe, expect, it } from "vitest";

import { addDays, addMonths, monthsBetween } from "@/lib/domain/tools/dates";
import { formatEuro, parseEuroInput } from "@/lib/domain/tools/money";

describe("tool dates", () => {
  it("rejects impossible calendar days", () => {
    expect(addMonths("2023-02-31", 1)).toBeNull();
  });

  it("clamps month-end dates", () => {
    expect(addMonths("2024-01-31", 1)).toBe("2024-02-29");
    expect(addMonths("2025-01-31", 1)).toBe("2025-02-28");
    expect(addMonths("2024-03-31", 1)).toBe("2024-04-30");
  });

  it("subtracts 30 calendar days across February", () => {
    expect(addDays("2024-03-01", -30)).toBe("2024-01-31");
    expect(addDays("2026-03-01", -30)).toBe("2026-01-30");
  });

  it("counts exact month boundaries as whole months", () => {
    expect(monthsBetween("2028-07-01", "2029-01-01")).toBe(6);
    expect(monthsBetween("2028-01-01", "2029-01-01")).toBe(12);
    expect(monthsBetween("2028-10-01", "2029-01-01")).toBe(3);
    expect(monthsBetween("2029-01-01", "2029-01-01")).toBe(0);
  });

  it("keeps a partial month as a fraction of that month", () => {
    expect(monthsBetween("2028-10-16", "2029-01-01")).toBeCloseTo(2 + 16 / 31, 10);
  });
});

describe("euro input", () => {
  it("parses Spanish amounts", () => {
    expect(parseEuroInput("1.200,50")).toBe(1200.5);
    expect(parseEuroInput("1.200")).toBe(1200);
    expect(parseEuroInput("10.50")).toBe(10.5);
    expect(parseEuroInput("0")).toBe(0);
    expect(formatEuro(1200.5)).toBe("1.200,50 €");
  });

  it("rejects extra decimals and blanks", () => {
    expect(parseEuroInput("10,999")).toBeNull();
    expect(parseEuroInput("")).toBeNull();
    expect(parseEuroInput("-5")).toBeNull();
  });
});
