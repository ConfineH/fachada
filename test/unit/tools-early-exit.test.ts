import { describe, expect, it } from "vitest";

import { earlyExitView } from "@/lib/domain/tools/copy";
import { assessEarlyExit, compensationCapEur } from "@/lib/domain/tools/early-exit";
import { formatEuro } from "@/lib/domain/tools/money";

const classic = {
  contract: "vivienda" as const,
  startDate: "2024-01-01",
  durationMonths: 60,
  monthlyRentEur: 1000,
  plannedExitDate: "2027-01-01",
  compensationAgreed: true,
};

describe("early exit proration", () => {
  it("charges one month of rent per exact year left", () => {
    expect(compensationCapEur(1000, "2028-01-01", "2029-01-01")).toBe(1000);
    expect(compensationCapEur(1000, "2028-07-01", "2029-01-01")).toBe(500);
    expect(compensationCapEur(1000, "2027-07-01", "2029-01-01")).toBe(1500);
    expect(compensationCapEur(1000, "2028-10-01", "2029-01-01")).toBe(250);
    expect(compensationCapEur(1000, "2029-01-01", "2029-01-01")).toBe(0);
    expect(compensationCapEur(850.5, "2028-07-01", "2029-01-01")).toBe(425.25);
  });

  it("prorates a broken month by the days of that month", () => {
    expect(compensationCapEur(1000, "2028-10-16", "2029-01-01")).toBe(209.68);
  });
});

describe("assessEarlyExit", () => {
  it("allows a leave on the six-month mark with 30 days of notice", () => {
    const result = assessEarlyExit({
      ...classic,
      durationMonths: 12,
      plannedExitDate: "2024-07-01",
      compensationAgreed: false,
    });
    expect(result).toMatchObject({
      status: "can_leave",
      earliestExit: "2024-07-01",
      noticeDeadline: "2024-06-01",
      compensation: { status: "zero", code: "not_agreed", eur: 0 },
    });
  });

  it("refuses a date before six months and shows the notice for the earliest leave", () => {
    const result = assessEarlyExit({
      ...classic,
      durationMonths: 12,
      plannedExitDate: "2024-04-01",
    });
    expect(result).toMatchObject({
      status: "too_soon",
      earliestExit: "2024-07-01",
      noticeDeadline: "2024-06-01",
      compensationBasis: "earliest",
    });
  });

  it("says the right never arises when the term ends at six months or sooner", () => {
    expect(
      assessEarlyExit({ ...classic, durationMonths: 6, plannedExitDate: "2024-06-01" }).status,
    ).toBe("right_never");
    expect(
      assessEarlyExit({ ...classic, durationMonths: 5, plannedExitDate: "2024-05-01" }).status,
    ).toBe("right_never");
  });

  it("treats a leave on the last day as the end of the contract", () => {
    const result = assessEarlyExit({
      ...classic,
      durationMonths: 12,
      plannedExitDate: "2025-01-01",
    });
    expect(result).toMatchObject({
      status: "term_ended",
      endDate: "2025-01-01",
      compensation: { eur: 0 },
    });
  });

  it("shows the old cap as doubtful when a pre-2026 contract agreed compensation", () => {
    const result = assessEarlyExit({
      ...classic,
      startDate: "2024-01-01",
      durationMonths: 60,
      plannedExitDate: "2028-01-01",
      monthlyRentEur: 1000,
    });
    expect(result).toMatchObject({
      status: "can_leave",
      regime: "classic",
      compensation: { status: "doubtful_cap", eur: 1000 },
    });
    if (result.status === "can_leave") {
      const view = earlyExitView(result);
      expect(view.compensationTitle.toLowerCase()).toContain("dudoso");
      expect(view.compensationBody).toContain(formatEuro(1000));
      expect(view.title.toLowerCase()).toContain("puedes irte");
    }
  });

  it("sets compensation to zero after 8 October 2026 only when the reform flag is on", () => {
    const input = {
      ...classic,
      startDate: "2026-10-08",
      durationMonths: 60,
      plannedExitDate: "2028-10-08",
      compensationAgreed: true,
    };
    expect(assessEarlyExit(input, true)).toMatchObject({
      status: "can_leave",
      regime: "post_2026",
      noticeDeadline: "2028-09-08",
      compensation: { status: "zero", code: "barred", eur: 0 },
    });
    const repealed = assessEarlyExit(input, false);
    expect(repealed).toMatchObject({
      status: "can_leave",
      regime: "classic",
      noticeDeadline: "2028-09-08",
    });
    if (repealed.status === "can_leave") {
      expect(repealed.compensation.status).not.toBe("zero");
    }
  });

  it("does not give a firm answer for seasonal or room lets", () => {
    expect(assessEarlyExit({ ...classic, contract: "temporada" })).toMatchObject({
      status: "doubtful",
      code: "seasonal",
    });
    expect(assessEarlyExit({ ...classic, contract: "habitacion" })).toMatchObject({
      code: "room",
    });
    expect(earlyExitView(assessEarlyExit({ ...classic, contract: "temporada" })).title).toMatch(
      /dudoso/i,
    );
  });

  it("rejects an exit before the start and a non-positive rent", () => {
    expect(assessEarlyExit({ ...classic, plannedExitDate: "2023-12-01" })).toMatchObject({
      code: "exit_before_start",
    });
    expect(assessEarlyExit({ ...classic, monthlyRentEur: 0 })).toMatchObject({
      code: "invalid_rent",
    });
  });
});
