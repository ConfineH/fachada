import { describe, expect, it } from "vitest";

import { IRAV_TABLE } from "@/lib/domain/tools/constants";
import { formatPercent, rentUpdateReply, rentUpdateView } from "@/lib/domain/tools/copy";
import { toolById } from "@/lib/domain/tools/catalog";
import {
  assessRentUpdate,
  isRentAnniversary,
  lookupIrav,
  type RentUpdateInput,
} from "@/lib/domain/tools/rent-update";
import { iravPublication, parseIneSeries } from "../../scripts/irav-parse.mjs";

function input(overrides: Partial<RentUpdateInput> = {}): RentUpdateInput {
  return {
    contractDate: "2024-05-01",
    updateDate: "2025-05-01",
    currentRentEur: 1000,
    hasClause: true,
    index: "irav",
    askedRentEur: null,
    aboveReference: null,
    reformActive: true,
    ...overrides,
  };
}

describe("assessRentUpdate", () => {
  it("refuses an update when the contract does not provide one", () => {
    const result = assessRentUpdate(input({ hasClause: false, updateDate: "2025-05-01", index: null }));
    expect(result).toMatchObject({ status: "ready", basis: "no_pact", percent: 0, maxRentEur: 1000 });
  });

  it("caps 2023 at 2% and 2024 at 3%", () => {
    expect(assessRentUpdate(input({ contractDate: "2022-06-01", updateDate: "2023-06-01" }))).toMatchObject({
      status: "ready",
      basis: "cap_2023",
      percent: 2,
      maxRentEur: 1020,
    });
    expect(assessRentUpdate(input({ contractDate: "2023-05-01", updateDate: "2024-05-01" }))).toMatchObject({
      status: "ready",
      basis: "cap_2024",
      percent: 3,
      maxRentEur: 1030,
    });
  });

  it("uses the last IRAV already published, and does not invent one that is not", () => {
    expect(assessRentUpdate(input())).toMatchObject({
      status: "ready",
      basis: "irav",
      percent: 1.98,
      iravMonth: "2025-03",
      maxRentEur: 1019.8,
    });
    const later = assessRentUpdate(
      input({ contractDate: "2025-11-15", updateDate: "2026-11-15", reformActive: false }),
    );
    expect(later).toMatchObject({ status: "ready", basis: "irav", iravMonth: "2026-09", percent: 2.54 });
    const unpublished = lookupIrav("2026-09-01", [
      {
        month: "2026-08",
        value: 2.47,
        source: "test",
        loadedOn: "2026-10-21",
        publishedOn: "2026-09-15",
        publishedOnEstimated: true,
      },
    ]);
    expect(unpublished).toEqual({ status: "missing", month: "2026-08" });
    expect(rentUpdateView({ status: "missing_irav", month: "2026-08", onAnniversary: true }).body).not.toContain(
      "No uso un mes más antiguo",
    );
  });

  it("uses July on 5 September 2026 and August on 20 September 2026", () => {
    expect(IRAV_TABLE.find((row) => row.month === "2026-07")).toMatchObject({
      publishedOn: "2026-08-15",
      publishedOnEstimated: true,
      value: 2.49,
    });
    expect(IRAV_TABLE.find((row) => row.month === "2026-08")).toMatchObject({
      publishedOn: "2026-09-15",
      publishedOnEstimated: true,
    });
    expect(lookupIrav("2026-09-05")).toMatchObject({ status: "ok", row: { month: "2026-07", value: 2.49 } });
    expect(lookupIrav("2026-09-20")).toMatchObject({ status: "ok", row: { month: "2026-08", value: 2.47 } });
    expect(
      assessRentUpdate(input({ contractDate: "2025-10-21", updateDate: "2026-10-21", reformActive: false })),
    ).toMatchObject({
      status: "ready",
      basis: "irav",
      percent: 2.54,
      iravMonth: "2026-09",
      maxRentEur: 1025.4,
    });
  });

  it("keeps the agreed index for contracts signed before 26 May 2023 until the reform applies", () => {
    const before = assessRentUpdate(
      input({ contractDate: "2022-09-05", updateDate: "2026-09-05", index: "ipc", reformActive: true }),
    );
    expect(before).toMatchObject({ status: "agreed_index", index: "ipc" });
    expect(before).not.toHaveProperty("percent");
    if (before.status !== "agreed_index") return;
    expect(rentUpdateView(before).body).toContain("IPC");
    expect(rentUpdateView(before).body).toContain("No doy una cifra");
    expect(rentUpdateView(before).body).not.toMatch(/€/);

    const flagOff = assessRentUpdate(
      input({ contractDate: "2022-10-21", updateDate: "2026-10-21", index: "ipc", reformActive: false }),
    );
    expect(flagOff.status).toBe("agreed_index");
    if (flagOff.status !== "agreed_index") return;
    expect(rentUpdateView(flagOff).body).toContain("No doy una cifra");
    expect(rentUpdateView(flagOff).body).toContain("IPC");

    const capped = assessRentUpdate(
      input({
        contractDate: "2022-10-21",
        updateDate: "2026-10-21",
        index: "ipc",
        reformActive: true,
        aboveReference: "within",
      }),
    );
    expect(capped).toMatchObject({
      status: "ready",
      basis: "extraordinary_two",
      percent: 2,
      iravMonth: "2026-09",
      iravValue: 2.54,
      maxRentEur: 1020,
    });
    expect(
      assessRentUpdate(input({ contractDate: "2023-05-26", updateDate: "2026-09-05", reformActive: false })).status,
    ).not.toBe("agreed_index");
  });

  it("says the 2% and 3% caps gave way to a new agreement if the landlord is not a large holder", () => {
    const cap2023 = assessRentUpdate(input({ contractDate: "2022-06-01", updateDate: "2023-06-01" }));
    const cap2024 = assessRentUpdate(input({ contractDate: "2022-06-01", updateDate: "2024-06-01" }));
    expect(rentUpdateView(cap2023).body).toContain("no es gran tenedor");
    expect(rentUpdateView(cap2023).body).toContain("2 %");
    expect(rentUpdateView(cap2023).body).toContain("nuevo pacto");
    expect(rentUpdateView(cap2024).body).toContain("3 %");
    expect(rentUpdateView(cap2024).body).toContain("nuevo pacto");
  });

  it("ignores the 2026 extraordinary limit when the reform flag is off", () => {
    const result = assessRentUpdate(
      input({
        contractDate: "2025-10-21",
        updateDate: "2026-10-21",
        reformActive: false,
        aboveReference: "within",
      }),
    );
    expect(result).toMatchObject({ status: "ready", basis: "irav", percent: 2.54, extraordinary: false });
  });

  it("applies the extraordinary limit only inside the reform window", () => {
    const base = input({ contractDate: "2025-10-21", updateDate: "2026-10-21", reformActive: true });
    expect(assessRentUpdate({ ...base, aboveReference: "above" })).toMatchObject({
      status: "ready",
      basis: "extraordinary_zero",
      percent: 0,
      maxRentEur: 1000,
    });
    expect(assessRentUpdate({ ...base, aboveReference: "within" })).toMatchObject({
      status: "ready",
      basis: "extraordinary_two",
      percent: 2,
      maxRentEur: 1020,
    });
    const unknown = assessRentUpdate({ ...base, aboveReference: "unknown" });
    expect(unknown.status).toBe("needs_reference");
    if (unknown.status !== "needs_reference") return;
    expect(unknown.maxIfAbove).toBe(1000);
    expect(unknown.maxIfWithin).toBe(1020);
    expect(unknown).not.toHaveProperty("maxRentEur");
    expect(assessRentUpdate({ ...base, aboveReference: null }).status).toBe("invalid");
  });

  it("uses the last published IRAV when the extraordinary window does not apply", () => {
    const result = assessRentUpdate(
      input({
        contractDate: "2024-06-01",
        updateDate: "2025-06-01",
        reformActive: true,
        aboveReference: "within",
      }),
    );
    expect(result).toMatchObject({ status: "ready", basis: "irav", percent: 2.09, iravMonth: "2025-04" });
  });

  it("flags a date that is not the anniversary and a February 29 rollover", () => {
    const mid = assessRentUpdate(input({ updateDate: "2025-05-02" }));
    expect(mid).toMatchObject({ status: "ready", onAnniversary: false });
    expect(isRentAnniversary("2024-02-29", "2025-02-28")).toBe(true);
    expect(isRentAnniversary("2024-02-29", "2028-02-29")).toBe(true);
    expect(isRentAnniversary("2024-02-29", "2025-03-01")).toBe(false);
  });

  it("says when the asked rent exceeds the cap and drafts a short reply", () => {
    const over = assessRentUpdate(
      input({ contractDate: "2023-05-01", updateDate: "2024-05-01", askedRentEur: 1100 }),
    );
    expect(over).toMatchObject({ status: "ready", exceeds: true, maxRentEur: 1030 });
    if (over.status !== "ready") return;
    expect(rentUpdateReply(over)).toContain("1.030,00 €");
    expect(rentUpdateReply(over)).toContain("1.100,00 €");
    const under = assessRentUpdate(
      input({ contractDate: "2023-05-01", updateDate: "2024-05-01", askedRentEur: 1030 }),
    );
    expect(under).toMatchObject({ exceeds: false });
    if (under.status !== "ready") return;
    expect(rentUpdateReply(under)).toBeNull();
  });

  it("rejects bad dates, a non-positive rent and an update before the contract", () => {
    expect(assessRentUpdate(input({ updateDate: "2025-02-29" })).status).toBe("invalid");
    expect(assessRentUpdate(input({ currentRentEur: 0 })).status).toBe("invalid");
    expect(assessRentUpdate(input({ updateDate: "2024-05-01", contractDate: "2024-05-01" })).status).toBe(
      "invalid",
    );
    expect(assessRentUpdate(input({ contractDate: "2021-01-01", updateDate: "2022-01-01" }))).toMatchObject({
      status: "unsupported_period",
      year: 2022,
    });
  });

  it("publishes the search title and the review date", () => {
    const tool = toolById("subida-alquiler");
    expect(tool.title.toLowerCase()).toContain("cuánto me pueden subir el alquiler");
    expect(tool.description.toLowerCase()).toContain("cuánto me pueden subir el alquiler");
    expect(tool.articleNote).toContain("21/10/2026");
    expect(formatPercent(2.54)).toBe("2,54 %");
    expect(formatPercent(2)).toBe("2 %");
  });
});

describe("parseIneSeries", () => {
  it("reads an INE publication date and otherwise estimates the 15th of the next month", () => {
    expect(iravPublication("2026-07", { FechaPublicacion: "2026-08-12" })).toEqual({
      publishedOn: "2026-08-12",
      publishedOnEstimated: false,
    });
    expect(iravPublication("2026-07", { Fecha: 1782856800000, Anyo: 2026, FK_Periodo: 7 })).toEqual({
      publishedOn: "2026-08-15",
      publishedOnEstimated: true,
    });
    expect(iravPublication("2026-12", null)).toEqual({
      publishedOn: "2027-01-15",
      publishedOnEstimated: true,
    });
    expect(IRAV_TABLE.every((row) => row.publishedOnEstimated && row.publishedOn > row.month)).toBe(true);
  });

  it("reads the month from Anyo and FK_Periodo, not from the timestamp", () => {
    const rows = parseIneSeries({
      Data: [
        { Fecha: 1788213600000, Anyo: 2026, FK_Periodo: 9, Valor: 2.54 },
        { Fecha: 1785535200000, Anyo: 2026, FK_Periodo: 8, Valor: 2.47 },
      ],
    });
    expect(rows).toEqual([
      { month: "2026-08", value: 2.47 },
      { month: "2026-09", value: 2.54 },
    ]);
  });
});
