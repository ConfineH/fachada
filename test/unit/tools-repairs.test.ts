import { describe, expect, it } from "vitest";

import { repairView } from "@/lib/domain/tools/copy";
import {
  BOE_RDL_29_2026,
  REFORM_2026_ACTIVE,
  REFORM_2026_NOTE,
  reform2026Note,
  reformStatuteLinks,
} from "@/lib/domain/tools/constants";
import { REPAIR_FLOW, assessRepair } from "@/lib/domain/tools/repairs";
import { TENANT_TOOLS } from "@/lib/domain/tools/catalog";

describe("assessRepair", () => {
  it("gives every frequent situation a payer for a habitual home", () => {
    const expected: Record<string, "arrendador" | "inquilino" | "dudoso"> = {
      "caldera:no_funciona": "arrendador",
      "caldera:mal_uso": "inquilino",
      "caldera:mantenimiento": "dudoso",
      "electrodomesticos:incluido_uso": "arrendador",
      "electrodomesticos:no_incluido": "inquilino",
      "humedades:filtracion": "arrendador",
      "humedades:condensacion": "dudoso",
      "persianas:cinta": "inquilino",
      "persianas:mecanismo": "arrendador",
      "cerraduras:llaves": "inquilino",
      "cerraduras:no_cierra": "arrendador",
      "grifos:goteo": "inquilino",
      "grifos:instalacion": "arrendador",
      "pintura:desgaste": "inquilino",
      "pintura:por_humedad": "arrendador",
      "pintura:no_se": "dudoso",
    };

    for (const [key, payer] of Object.entries(expected)) {
      const [item, situation] = key.split(":");
      const result = assessRepair({ contract: "vivienda", item: item!, situation: situation! });
      if (payer === "dudoso") {
        expect(result.status, key).toBe("doubtful");
      } else {
        expect(result, key).toMatchObject({ status: "answered", payer });
      }
    }
  });

  it("covers every situation in the tree with a non-empty explanation", () => {
    for (const item of REPAIR_FLOW) {
      for (const situation of item.situations) {
        const result = assessRepair({
          contract: "vivienda",
          item: item.id,
          situation: situation.id,
        });
        expect(result.status, `${item.id}:${situation.id}`).not.toBe("incomplete");
        if (result.status === "incomplete") continue;
        const view = repairView(result);
        expect(view.title.length).toBeGreaterThan(5);
        expect(view.message).toContain("inquilino");
        expect(view.steps.length).toBeGreaterThan(0);
      }
    }
  });

  it("keeps habitability with the landlord and ordinary wear with the tenant", () => {
    const boiler = assessRepair({
      contract: "vivienda",
      item: "caldera",
      situation: "no_funciona",
    });
    const tap = assessRepair({ contract: "vivienda", item: "grifos", situation: "goteo" });
    expect(boiler).toMatchObject({ payer: "arrendador", nuance: "habitabilidad" });
    expect(tap).toMatchObject({ payer: "inquilino", nuance: "pequena" });
    if (boiler.status === "answered") {
      const steps = repairView(boiler).steps.join(" ");
      if (REFORM_2026_ACTIVE) expect(steps).toContain("quince días");
      else expect(steps).toContain("21.3");
    }
  });

  it("answers that the tenant pays when the seasonal damage is their fault", () => {
    const faults = [
      ["caldera", "mal_uso"],
      ["electrodomesticos", "lo_rompi"],
      ["persianas", "lo_rompi"],
      ["cerraduras", "llaves"],
      ["grifos", "lo_rompi"],
      ["pintura", "la_dane"],
      ["humedades", "lo_cause"],
    ] as const;
    for (const [item, situation] of faults) {
      const result = assessRepair({ contract: "temporada", item, situation });
      expect(result, situation).toMatchObject({
        status: "answered",
        payer: "inquilino",
        nuance: "culpa",
      });
      if (result.status === "answered") {
        expect(repairView(result).title).toMatch(/lo pagas tú/i);
      }
    }
  });

  it("follows both values of the 2026 flag for seasonal wear, and still charges the tenant for fault", () => {
    const wear = { contract: "temporada" as const, item: "grifos", situation: "goteo" };
    const leak = { contract: "temporada" as const, item: "humedades", situation: "filtracion" };
    const fault = { contract: "temporada" as const, item: "caldera", situation: "mal_uso" };
    expect(assessRepair(wear, true)).toMatchObject({
      status: "doubtful",
      code: "temporal_desgaste",
    });
    expect(assessRepair(wear, false)).toMatchObject({
      status: "answered",
      payer: "inquilino",
      nuance: "pequena",
    });
    expect(assessRepair(leak, true)).toMatchObject({
      payer: "arrendador",
      nuance: "temporal_habitabilidad",
    });
    expect(assessRepair(leak, false)).toMatchObject({
      payer: "arrendador",
      nuance: "habitabilidad",
    });
    for (const active of [true, false]) {
      const result = assessRepair(fault, active);
      expect(result, String(active)).toMatchObject({
        status: "answered",
        payer: "inquilino",
        nuance: "culpa",
      });
      if (result.status === "answered") {
        expect(repairView(result).title).toMatch(/lo pagas tú/i);
      }
    }
  });

  it("marks a room as doubtful before asking what broke", () => {
    expect(assessRepair({ contract: "habitacion", item: "", situation: "" })).toMatchObject({
      status: "doubtful",
      code: "habitacion",
    });
  });
});

describe("tenant tool catalog", () => {
  it("publishes four tools with faqs and a consolidated statute link", () => {
    expect(TENANT_TOOLS.map((tool) => tool.path)).toEqual([
      "/herramientas/honorarios",
      "/herramientas/fianza",
      "/herramientas/reparaciones",
      "/herramientas/salida-anticipada",
    ]);
    for (const tool of TENANT_TOOLS) {
      expect(tool.faqs.length).toBeGreaterThanOrEqual(3);
      expect(tool.articleUrl).toContain("BOE-A-1994-26003");
      expect(tool.description.length).toBeGreaterThan(40);
    }
  });

  it("states the reform status for both flag values and drops the decree link if it is repealed", () => {
    expect(reform2026Note(true)).toBe(
      "Norma en vigor desde el 08/10/2026, pendiente de convalidación; revisado a fecha 20/10/2026.",
    );
    expect(reform2026Note(false)).toBe("El RDL 29/2026 no fue convalidado");
    expect(REFORM_2026_NOTE).toBe(reform2026Note(true));
    expect(REFORM_2026_ACTIVE).toBe(true);
    expect(reformStatuteLinks(true).map((link) => link.href)).toContain(BOE_RDL_29_2026);
    expect(reformStatuteLinks(false)).toEqual([]);
    for (const tool of TENANT_TOOLS) {
      const decree = tool.extraLinks.filter((link) => link.href === BOE_RDL_29_2026);
      expect(decree, tool.id).toEqual(reformStatuteLinks(REFORM_2026_ACTIVE));
    }
  });
});
