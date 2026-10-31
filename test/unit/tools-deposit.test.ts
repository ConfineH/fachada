import { describe, expect, it } from "vitest";

import { REFORM_2026_ACTIVE } from "@/lib/domain/tools/constants";
import {
  DEPOSIT_ART_36,
  DEPOSIT_STAYS_LOCAL,
  depositDocuments,
  depositGuaranteeText,
} from "@/lib/domain/tools/copy";
import { assessDeposit, type DepositInput, type DepositReady } from "@/lib/domain/tools/deposit";
import { formatEuro } from "@/lib/domain/tools/money";

const base = {
  landlordName: "Inmobiliaria Sol",
  tenantName: "Ana Ruiz",
  address: "Calle Mayor 1, Madrid",
  contractStart: "2024-01-01",
  contractEnd: "2029-01-01",
  keysDate: "2026-03-15",
  depositEur: 900,
  extraEur: 1800,
  deductionEur: 0,
  deductionDetail: "",
  acceptDeduction: false,
  today: "2026-03-20",
};

function ready(
  overrides: Partial<DepositInput> = {},
  reformActive = REFORM_2026_ACTIVE,
): DepositReady {
  const result = assessDeposit({ ...base, ...overrides }, reformActive);
  if (result.status !== "ready") throw new Error(result.status);
  return result;
}

describe("assessDeposit", () => {
  it("sets the deadline one month after the keys and starts interest the next day", () => {
    expect(ready({ today: "2026-04-14" })).toMatchObject({
      deadline: "2026-04-15",
      deadlineStatus: "pending",
      interestStarted: false,
    });
    expect(ready({ today: "2026-04-15" })).toMatchObject({
      deadlineStatus: "due_today",
      interestStarted: false,
    });
    expect(ready({ today: "2026-04-16" })).toMatchObject({
      deadlineStatus: "overdue",
      interestStarted: true,
    });
  });

  it("clamps a 31 January handover onto the last day of February", () => {
    expect(ready({ keysDate: "2025-01-31", today: "2025-02-01" }).deadline).toBe("2025-02-28");
    expect(ready({ keysDate: "2024-01-31", today: "2024-02-01" }).deadline).toBe("2024-02-29");
  });

  it("claims the full sum when the deduction is contested and the balance when it is accepted", () => {
    expect(
      ready({ deductionEur: 200, deductionDetail: "limpieza", acceptDeduction: false }).claimedEur,
    ).toBe(2700);
    expect(
      ready({ deductionEur: 200, deductionDetail: "limpieza", acceptDeduction: true }).claimedEur,
    ).toBe(2500);
  });

  it("applies the handover presumption for both flag values only on or after 8 October 2026", () => {
    expect(ready({ keysDate: "2026-10-08", today: "2026-10-09" }, true).presumptionApplies).toBe(
      true,
    );
    expect(ready({ keysDate: "2026-10-08", today: "2026-10-09" }, false).presumptionApplies).toBe(
      false,
    );
    expect(ready({ keysDate: "2026-10-07", today: "2026-10-08" }, true).presumptionApplies).toBe(
      false,
    );
  });

  it("warns when the deposit or extra guarantees exceed the LAU caps, and only if rent is given", () => {
    const withinGuarantee = ready({ monthlyRentEur: 900, depositEur: 1000, extraEur: 0 });
    expect(withinGuarantee.excessiveDeposit).toBe(false);
    expect(withinGuarantee.excessiveGuarantee).toBe(false);
    expect(depositDocuments(withinGuarantee).letter).not.toContain("cobro indebido");
    expect(depositDocuments(withinGuarantee).letter).not.toContain("artículo 36.1");

    const depositOverflow = ready({ monthlyRentEur: 900, depositEur: 4000, extraEur: 0 });
    expect(depositOverflow.excessiveDeposit).toBe(true);
    expect(depositOverflow.excessiveGuarantee).toBe(true);
    const overflowDocs = depositDocuments(depositOverflow);
    expect(overflowDocs.letter).toContain("artículo 36.1");
    expect(overflowDocs.letter).toContain("Solo el sobrante");
    expect(overflowDocs.burofax).toContain("artículo 36.1");

    const extra = ready({ monthlyRentEur: 900, depositEur: 900, extraEur: 1800.01 });
    expect(extra.excessiveGuarantee).toBe(true);
    expect(extra.guaranteeCap).toBe("housing_five");
    expect(depositDocuments(extra).letter).toContain("artículo 36.5");
    expect(depositDocuments(extra).letter).toContain("dos mensualidades");
    expect(depositDocuments(extra).letter).toContain("cinco años");
    expect(depositDocuments(extra).letter).not.toContain("fija ese tope en el arrendamiento de vivienda");

    const seasonal = ready({
      monthlyRentEur: 900,
      depositEur: 900,
      extraEur: 900.01,
      contractKind: "temporada",
      contractStart: "2026-10-08",
      contractEnd: "2027-04-08",
      keysDate: "2027-04-08",
      today: "2027-04-09",
    });
    expect(seasonal.excessiveDeposit).toBe(false);
    expect(seasonal.excessiveGuarantee).toBe(true);
    expect(seasonal.presumptionApplies).toBe(true);
    expect(depositDocuments(seasonal).letter).toContain("una mensualidad");
    expect(depositDocuments(seasonal).burofax).toContain("artículo 36.5");

    const oldSeasonal = ready({
      monthlyRentEur: 900,
      depositEur: 2000,
      extraEur: 900.01,
      contractKind: "temporada",
    });
    expect(oldSeasonal.excessiveDeposit).toBe(false);
    expect(oldSeasonal.excessiveGuarantee).toBe(false);

    expect(ready().excessiveDeposit).toBe(false);
    expect(ready().excessiveGuarantee).toBe(false);
    expect(depositDocuments(ready()).letter).not.toContain("artículo 36.1");
  });

  it("leaves a pre-reform seasonal contract outside the new cap and the article 36.7 presumption", () => {
    const result = ready({
      contractKind: "temporada",
      contractStart: "2024-01-01",
      contractEnd: "2024-08-01",
      keysDate: "2026-10-10",
      today: "2026-10-11",
      monthlyRentEur: 900,
      depositEur: 900,
      extraEur: 1800,
    });
    expect(result.excessiveGuarantee).toBe(false);
    expect(result.excessiveDeposit).toBe(false);
    expect(result.presumptionApplies).toBe(false);
    expect(result.guaranteeCap).toBe("none");
    const docs = depositDocuments(result);
    expect(docs.letter).not.toContain("36.7");
    expect(docs.burofax).not.toContain("36.7");
    expect(docs.letter).not.toContain("artículo 36.5");
    expect(docs.burofax).not.toContain("artículo 36.5");
    expect(docs.letter).not.toMatch(/ilegal/i);
  });

  it("does not treat extra guarantees as illegal when the housing contract exceeds seven years", () => {
    const result = ready({
      contractStart: "2016-01-01",
      contractEnd: "2026-01-01",
      keysDate: "2026-01-01",
      today: "2026-01-02",
      monthlyRentEur: 1000,
      depositEur: 1000,
      extraEur: 3000,
    });
    expect(result.excessiveGuarantee).toBe(false);
    expect(result.excessiveDeposit).toBe(false);
    expect(result.guaranteeCap).toBe("none");
    const docs = depositDocuments(result);
    expect(docs.letter).not.toContain("artículo 36.5");
    expect(docs.burofax).not.toContain("artículo 36.5");
    expect(docs.letter).not.toMatch(/ilegal/i);
  });

  it("still marks three months of guarantees as illegal on a five-year housing lease", () => {
    const result = ready({
      contractStart: "2021-01-01",
      contractEnd: "2026-01-01",
      keysDate: "2026-01-01",
      today: "2026-02-02",
      monthlyRentEur: 1000,
      depositEur: 1000,
      extraEur: 3000,
    });
    expect(result.excessiveGuarantee).toBe(true);
    expect(result.guaranteeCap).toBe("housing_five");
    const docs = depositDocuments(result);
    expect(docs.letter).toContain("artículo 36.5");
    expect(docs.letter).toContain("cinco años");
    expect(docs.burofax).toContain("artículo 36.5");
    expect(docs.letter).not.toContain("fija ese tope en el arrendamiento de vivienda");
  });

  it("applies the seven-year cap only when the landlord is a legal entity", () => {
    const shared = {
      contractStart: "2020-01-01",
      contractEnd: "2026-01-01",
      keysDate: "2026-01-01",
      today: "2026-02-02",
      monthlyRentEur: 1000,
      depositEur: 1000,
      extraEur: 3000,
    };
    expect(ready({ ...shared, landlordLegalEntity: true })).toMatchObject({
      excessiveGuarantee: true,
      guaranteeCap: "housing_seven",
    });
    expect(ready({ ...shared, landlordLegalEntity: false })).toMatchObject({
      excessiveGuarantee: false,
      guaranteeCap: "none",
    });
    const unknown = ready({ ...shared, landlordLegalEntity: null });
    expect(unknown.excessiveGuarantee).toBe(false);
    expect(unknown.guaranteeCap).toBe("uncertain_landlord");
    const docs = depositDocuments(unknown);
    expect(docs.letter).toContain("No se puede afirmar que ese exceso sea ilegal");
    expect(docs.burofax).toContain("No se puede afirmar que ese exceso sea ilegal");
    expect(docs.letter).not.toContain("el tope sí rige");
  });

  it("does not blame extra guarantees when only their sum with the deposit surplus crosses the cap", () => {
    const housing = ready({ monthlyRentEur: 900, depositEur: 2700, extraEur: 0.01 });
    expect(housing).toMatchObject({
      guaranteeCap: "housing_five",
      guaranteeExcess: "sum",
      excessiveGuarantee: true,
    });
    const housingText = depositGuaranteeText(housing);
    expect(housingText).not.toMatch(/Las garantías adicionales superan dos mensualidades/);
    expect(housingText).toContain("no superan por sí solas dos mensualidades de renta");
    expect(housingText).toContain("sumarlas a lo que la fianza pasa de una mensualidad");
    expect(depositDocuments(housing).letter).toContain(housingText);
    expect(depositDocuments(housing).burofax).not.toMatch(
      /Las garantías adicionales superan dos mensualidades/,
    );

    const openEnded = ready({ monthlyRentEur: 900, depositEur: 4000, extraEur: 0, contractEnd: "" });
    expect(openEnded).toMatchObject({ guaranteeCap: "uncertain_end", guaranteeExcess: "deposit" });
    const openText = depositGuaranteeText(openEnded);
    expect(openText).not.toMatch(/garantías adicionales superan/i);
    expect(openText).toContain("la fianza que pasa de una mensualidad");
    expect(depositDocuments(openEnded).letter).not.toMatch(/garantías adicionales superan/i);
    expect(depositDocuments(openEnded).burofax).not.toMatch(/garantías adicionales superan/i);

    const seasonal = ready({
      monthlyRentEur: 900,
      depositEur: 1800,
      extraEur: 0.01,
      contractKind: "temporada",
      contractStart: "2026-10-08",
      contractEnd: "2027-04-08",
      keysDate: "2027-04-08",
      today: "2027-04-09",
    });
    expect(seasonal).toMatchObject({ guaranteeCap: "temporal", guaranteeExcess: "sum" });
    const seasonalText = depositGuaranteeText(seasonal);
    expect(seasonalText).not.toMatch(/Las garantías adicionales superan una mensualidad/);
    expect(seasonalText).toContain("no superan por sí solas una mensualidad");
    expect(seasonalText).toContain("sumarlas a lo que la fianza pasa de una mensualidad");
  });

  it("refuses a letter when the dates or the accepted deduction do not add up", () => {
    expect(assessDeposit({ ...base, keysDate: "2023-12-01" })).toMatchObject({
      code: "keys_before_contract",
    });
    expect(
      assessDeposit({ ...base, deductionEur: 5000, acceptDeduction: true }),
    ).toMatchObject({ code: "deduction_exceeds" });
    expect(assessDeposit({ ...base, depositEur: 0, extraEur: 0 })).toMatchObject({
      code: "no_amount",
    });
    expect(assessDeposit({ ...base, tenantName: "  " })).toMatchObject({
      code: "missing_parties",
    });
  });
});

describe("deposit letter", () => {
  it("names the parties, the article and the contested deduction", () => {
    const docs = depositDocuments(
      ready({ deductionEur: 150, deductionDetail: "pintura", acceptDeduction: false }),
    );
    expect(docs.letter).toContain("Ana Ruiz");
    expect(docs.letter).toContain("Inmobiliaria Sol");
    expect(docs.letter).toContain(DEPOSIT_ART_36);
    expect(docs.letter).toContain(formatEuro(2700));
    expect(docs.letter).toContain("No lo acepto");
    expect(docs.burofax).toContain("BUROFAX");
    expect(docs.burofax).toContain(DEPOSIT_ART_36);
  });

  it("states that the balance already accrues interest once the month has passed", () => {
    const docs = depositDocuments(ready({ today: "2026-05-01" }));
    expect(docs.letter).toContain("interés legal");
    expect(docs.letter).toContain("venció");
  });

  it("keeps the privacy promise in the shared copy", () => {
    expect(DEPOSIT_STAYS_LOCAL).toMatch(/no salen del navegador/i);
    expect(DEPOSIT_STAYS_LOCAL).toMatch(/no los guarda/i);
  });
});
