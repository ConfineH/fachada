import { describe, expect, it } from "vitest";

import { feeView } from "@/lib/domain/tools/copy";
import { assessFees } from "@/lib/domain/tools/fees";
import { formatEuro } from "@/lib/domain/tools/money";

const base = {
  signedOn: "2024-06-01",
  contract: "vivienda" as const,
  amountEur: 1200,
  concept: "honorarios" as const,
  collector: "agencia" as const,
};

describe("assessFees", () => {
  it("treats 25 May 2023 as before the reform and 26 May as covered", () => {
    expect(assessFees({ ...base, signedOn: "2023-05-25" }).status).toBe("doubtful");
    expect(assessFees({ ...base, signedOn: "2023-05-25" })).toMatchObject({
      code: "before_reform",
    });
    expect(assessFees({ ...base, signedOn: "2023-05-26" })).toMatchObject({
      status: "reclaimable",
      amountEur: 1200,
    });
  });

  it("marks seasonal and room contracts as doubtful even after the reform", () => {
    expect(assessFees({ ...base, contract: "temporada", signedOn: "2026-11-01" })).toMatchObject({
      status: "doubtful",
      code: "seasonal",
    });
    expect(assessFees({ ...base, contract: "habitacion" })).toMatchObject({
      code: "room",
    });
  });

  it("reclaims management, fees and solvency checks, not an unnamed concept", () => {
    expect(assessFees({ ...base, concept: "gestion" }).status).toBe("reclaimable");
    expect(assessFees({ ...base, concept: "solvencia" }).status).toBe("reclaimable");
    expect(assessFees({ ...base, concept: "otro" })).toMatchObject({ code: "other_concept" });
  });

  it("does not change the verdict based on who collected the money", () => {
    expect(assessFees({ ...base, collector: "arrendador" }).status).toBe("reclaimable");
    expect(assessFees({ ...base, collector: "otro" }).status).toBe("reclaimable");
  });

  it("uses the 2000 euro lawyer threshold from the civil procedure act", () => {
    expect(assessFees({ ...base, amountEur: 2000 })).toMatchObject({ lawyerRequired: false });
    expect(assessFees({ ...base, amountEur: 2000.01 })).toMatchObject({ lawyerRequired: true });
  });

  it("rejects a zero, a negative or an impossible date", () => {
    expect(assessFees({ ...base, amountEur: 0 })).toMatchObject({ code: "no_amount" });
    expect(assessFees({ ...base, amountEur: -1 })).toMatchObject({ code: "invalid_amount" });
    expect(assessFees({ ...base, signedOn: "2023-02-31" })).toMatchObject({
      code: "invalid_date",
    });
  });

  it("keeps a firm claim out of doubtful explanations", () => {
    const view = feeView(assessFees({ ...base, contract: "temporada" }));
    expect(view.title.toLowerCase()).toContain("dudoso");
    expect(view.steps).toHaveLength(0);
    expect(view.body.length).toBeGreaterThan(40);
  });

  it("names the four steps and the amount when the charge looks improper", () => {
    const view = feeView(assessFees(base));
    expect(view.title).toContain(formatEuro(1200));
    expect(view.steps).toHaveLength(4);
    expect(view.steps[0]).toContain("agencia");
    expect(view.steps[2]).toContain("OMIC");
    expect(view.steps[3]).toContain("2.000");
    expect(view.steps[3]).toContain("sin abogado");
  });
});
