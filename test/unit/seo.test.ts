import { describe, expect, it } from "vitest";

import {
  HOME_FAQS,
  absoluteUrl,
  agencyJsonLd,
  breadcrumbJsonLd,
  faqJsonLd,
  pageMeta,
} from "@/lib/seo";

describe("seo helpers", () => {
  it("builds a public absolute url", () => {
    expect(absoluteUrl("/agencias")).toMatch(/\/agencias$/);
    expect(absoluteUrl("/")).toMatch(/^https?:\/\//);
  });

  it("omits aggregate rating when there are no published reviews", () => {
    const data = agencyJsonLd({
      name: "Sol",
      slug: "sol-madrid",
      city: "Madrid",
      address: "Calle Mayor 1",
      postalCode: "28013",
      reviewCount: 0,
      averageRating: 0,
    });
    expect(data["@type"]).toBe("RealEstateAgent");
    expect(data.aggregateRating).toBeUndefined();
  });

  it("keeps homepage FAQs extractable and paired with schema", () => {
    const schema = faqJsonLd([...HOME_FAQS]);
    expect(schema.mainEntity).toHaveLength(HOME_FAQS.length);
    expect(HOME_FAQS[0]?.answer).toContain("experiencia acreditada");
  });

  it("sets a self-canonical and matching social title", () => {
    const meta = pageMeta(
      "Registro de inmobiliarias",
      "Busca inmobiliarias en España.",
      "/agencias",
    );
    expect(meta.alternates.canonical).toBe("/agencias");
    expect(meta.openGraph.title).toBe("Registro de inmobiliarias");
    expect(meta.openGraph.url).toMatch(/\/agencias$/);
  });

  it("lists breadcrumb positions from the homepage", () => {
    const schema = breadcrumbJsonLd([
      { name: "Ciudades", path: "/explorar" },
      { name: "Madrid", path: "/ciudades/madrid" },
    ]);
    expect(schema.itemListElement[0]).toMatchObject({
      position: 1,
      name: "Ciudades",
    });
  });
});
