import { describe, expect, it } from "vitest";

import {
  DEFAULT_DESCRIPTION,
  DEFAULT_TITLE,
  HOME_FAQS,
  SHARE_DESCRIPTION,
  absoluteUrl,
  agencyJsonLd,
  agencyRecordCopy,
  breadcrumbJsonLd,
  faqJsonLd,
  pageMeta,
} from "@/lib/seo";

describe("seo helpers", () => {
  it("builds a public absolute url", () => {
    expect(absoluteUrl("/agencias")).toMatch(/\/agencias$/);
    expect(absoluteUrl("/")).toMatch(/^https?:\/\//);
  });

  it("omits aggregate rating for empty, single and blended samples", () => {
    const base = {
      name: "Sol",
      slug: "sol-madrid",
      city: "Madrid",
      address: "Calle Mayor 1",
      postalCode: "28013",
    };
    for (const sample of [
      { reviewCount: 0, averageRating: 0 },
      { reviewCount: 1, averageRating: 4 },
      { reviewCount: 3, averageRating: 4.5 },
    ]) {
      const data = agencyJsonLd({ ...base, ...sample });
      expect(data["@type"]).toBe("RealEstateAgent");
      expect(data).not.toHaveProperty("aggregateRating");
    }
  });

  it("keeps the opinion query on empty fichas and states that none exist", () => {
    const empty = agencyRecordCopy("Sol", "Madrid", 0);
    expect(empty.title).toBe("Opiniones de Sol · sin experiencias");
    expect(empty.description).toMatch(/Todavía no hay experiencias/);
    const one = agencyRecordCopy("Sol", "Madrid", 1);
    expect(one.title).toBe("Opiniones de Sol");
    expect(one.description).toMatch(/1 experiencia publicada/);
    expect(one.description).not.toMatch(/1 experiencias/);
    const many = agencyRecordCopy("Sol", "Madrid", 2);
    expect(many.description).toMatch(/2 experiencias publicadas/);
  });

  it("keeps homepage FAQs extractable and paired with schema", () => {
    const schema = faqJsonLd([...HOME_FAQS]);
    expect(schema.mainEntity).toHaveLength(HOME_FAQS.length);
    expect(HOME_FAQS[0]?.answer).toContain("experiencia acreditada");
    expect(HOME_FAQS[1]?.answer).toMatch(/reputación de la inmobiliaria/i);
    expect(HOME_FAQS[1]?.answer).not.toMatch(/vende anuncios/i);
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
    expect(meta.twitter.card).toBe("summary_large_image");
  });

  it("uses a short line for WhatsApp when the home copy is long", () => {
    const meta = pageMeta(
      DEFAULT_TITLE,
      DEFAULT_DESCRIPTION,
      "/",
      SHARE_DESCRIPTION,
    );
    expect(meta.description).toBe(DEFAULT_DESCRIPTION);
    expect(meta.openGraph.description).toBe(SHARE_DESCRIPTION);
    expect(meta.openGraph.description.length).toBeLessThan(120);
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
