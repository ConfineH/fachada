import { describe, expect, it } from "vitest";

import { REFORM_2026_ACTIVE } from "@/lib/domain/tools/constants";
import { DEPOSIT_ART_36, DEPOSIT_STAYS_LOCAL, depositDocuments } from "@/lib/domain/tools/copy";
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

function ready(overrides: Partial<DepositInput> = {}): DepositReady {
  const result = assessDeposit({ ...base, ...overrides });
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

  it("applies the handover presumption only when the 2026 reform is active and the keys were returned on or after 8 October 2026", () => {
    expect(ready({ keysDate: "2026-10-08", today: "2026-10-09" }).presumptionApplies).toBe(
      REFORM_2026_ACTIVE,
    );
    expect(ready({ keysDate: "2026-10-07", today: "2026-10-08" }).presumptionApplies).toBe(false);
  });

  it("warns when the deposit or extra guarantees exceed the LAU caps, and only if rent is given", () => {
    const housing = ready({ monthlyRentEur: 900, depositEur: 1000, extraEur: 0 });
    expect(housing.excessiveDeposit).toBe(true);
    expect(housing.excessiveGuarantee).toBe(false);
    const housingDocs = depositDocuments(housing);
    expect(housingDocs.letter).toContain("artículo 36.1");
    expect(housingDocs.burofax).toContain("artículo 36.1");

    const extra = ready({ monthlyRentEur: 900, depositEur: 900, extraEur: 1800.01 });
    expect(extra.excessiveGuarantee).toBe(true);
    expect(depositDocuments(extra).letter).toContain("artículo 36.5");
    expect(depositDocuments(extra).letter).toContain("dos mensualidades");

    const seasonal = ready({
      monthlyRentEur: 900,
      depositEur: 2000,
      extraEur: 900.01,
      contractKind: "temporada",
    });
    expect(seasonal.excessiveDeposit).toBe(false);
    expect(seasonal.excessiveGuarantee).toBe(true);
    expect(depositDocuments(seasonal).letter).toContain("una mensualidad");
    expect(depositDocuments(seasonal).burofax).toContain("artículo 36.5");

    expect(ready().excessiveDeposit).toBe(false);
    expect(ready().excessiveGuarantee).toBe(false);
    expect(depositDocuments(ready()).letter).not.toContain("artículo 36.1");
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
