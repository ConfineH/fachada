import { describe, expect, it } from "vitest";

import { repairView } from "@/lib/domain/tools/copy";
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
      expect(repairView(boiler).steps.join(" ")).toContain("quince días");
    }
  });

  it("does not make the tenant pay ordinary wear in a seasonal let", () => {
    const result = assessRepair({ contract: "temporada", item: "grifos", situation: "goteo" });
    expect(result).toMatchObject({ status: "doubtful", code: "temporal_desgaste" });
    if (result.status === "doubtful") {
      expect(repairView(result).title.toLowerCase()).toContain("dudoso");
    }
  });

  it("still assigns a clear leak in a seasonal let to the landlord", () => {
    expect(
      assessRepair({ contract: "temporada", item: "humedades", situation: "filtracion" }),
    ).toMatchObject({ payer: "arrendador", nuance: "temporal_habitabilidad" });
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
});
