import { describe, expect, it } from "vitest";

import { TENANT_TOOLS, TOOLS_INDEX, toolById } from "@/lib/domain/tools/catalog";
import { toolTextsReviewedIso } from "@/lib/domain/tools/constants";
import { itemListJsonLd, webApplicationJsonLd } from "@/lib/seo";

const BRAND = " · Fachada";

describe("tool search snippets", () => {
  it("keeps titles and descriptions inside the snippet", () => {
    for (const tool of TENANT_TOOLS) {
      expect(tool.title.length + BRAND.length, tool.id).toBeLessThanOrEqual(60);
      expect(tool.description.length, tool.id).toBeLessThanOrEqual(160);
      expect(tool.description.length, tool.id).toBeGreaterThan(40);
    }
    expect(TOOLS_INDEX.title.length + BRAND.length).toBeLessThanOrEqual(60);
    expect(TOOLS_INDEX.description.length).toBeLessThanOrEqual(160);
  });

  it("names the query a tenant would type", () => {
    expect(toolById("honorarios").description.toLowerCase()).toContain("alquiler");
    expect(toolById("fianza").title.toLowerCase()).toContain("reclamar la fianza");
    expect(toolById("reparaciones").title.toLowerCase()).toContain(
      "reparaciones del alquiler",
    );
    expect(toolById("salida-anticipada").title.toLowerCase()).toContain("desistir");
    expect(toolById("acta-entrega-llaves").description.toLowerCase()).toContain(
      "acta entrega llaves alquiler",
    );
    expect(toolById("subida-alquiler").description.toLowerCase()).toContain("irav");
    expect(TOOLS_INDEX.title.toLowerCase()).toContain("calculadoras de alquiler");
  });

  it("describes each calculator as a free web app and lists them", () => {
    const tool = TENANT_TOOLS[0];
    const schema = webApplicationJsonLd({
      name: tool.title,
      description: tool.description,
      path: tool.path,
      dateModified: toolTextsReviewedIso(),
    });
    expect(schema["@type"]).toBe("WebApplication");
    expect(schema.offers).toMatchObject({ price: "0", priceCurrency: "EUR" });
    expect(schema.isAccessibleForFree).toBe(true);
    expect(schema.dateModified).toBe("2026-10-21");
    expect(schema).not.toHaveProperty("aggregateRating");

    const list = itemListJsonLd(
      TENANT_TOOLS.map((entry) => ({ name: entry.title, path: entry.path })),
    );
    expect(list.itemListElement).toHaveLength(TENANT_TOOLS.length);
    expect(list.itemListElement[0]).toMatchObject({ position: 1 });
  });
});
