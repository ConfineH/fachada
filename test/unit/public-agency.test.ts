import { describe, expect, it } from "vitest";

import { GET as getAgency } from "@/app/api/agencies/[slug]/route";
import { GET as listAgencies } from "@/app/api/agencies/route";
import { archivePublicLine } from "@/lib/domain/archive-counts";
import { composeRelatoBody } from "@/lib/domain/review-copy";
import { publicAgencyDetail } from "@/lib/domain/public-agency";
import { MemoryStore } from "@/lib/repositories/memory-store";
import { AgencyService } from "@/lib/services/agency-service";

const FORBIDDEN_KEYS = [
  "userId",
  "evidencePath",
  "evidenceDeleteAfter",
  "moderationReason",
  "moderatedAt",
  "prefilterOutcome",
  "prefilterCodes",
  "prefilterReasons",
  "termsVersion",
  "termsAcceptedAt",
  "firstHandAttested",
  "noIncentiveAttested",
  "noConflictAttested",
  "flagged",
  "moderated",
  "deletedAt",
  "origen",
  "logoPath",
  "premium",
  "brandSlug",
  "sourceUrl",
  "agencyId",
];

function collectKeys(value: unknown, found = new Set<string>()) {
  if (Array.isArray(value)) {
    for (const item of value) collectKeys(item, found);
    return found;
  }
  if (value && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) {
      found.add(key);
      collectKeys(child, found);
    }
  }
  return found;
}

describe("public agency representation", () => {
  it("publishes an allowlist and the relato as text, not the internal envelope", async () => {
    const store = new MemoryStore();
    const service = new AgencyService(store);
    const ficha = (await service.getBySlug("inmobiliaria-sol-madrid", {
      publicOnly: false,
    }))!;
    const review = ficha.reviews[0]!;
    const narrative = "Tardaron tres semanas en devolver la fianza del piso.";
    const detail = publicAgencyDetail({
      ...ficha,
      phonePublished: false,
      phone: "600111222",
      email: "alta@fachada.local",
      logoPath: "private/logos/secret.png",
      premium: true,
      brandSlug: "internal-brand",
      reviews: [
        {
          ...review,
          userId: "user-secret-42",
          evidencePath: "private/evidence/secret.pdf",
          evidenceDeleteAfter: new Date("2030-01-01"),
          moderationReason: "motivo interno de moderación",
          moderatedAt: new Date("2026-01-01"),
          prefilterOutcome: "held",
          prefilterCodes: ["crime_accusation"],
          prefilterReasons: ["texto retenido interno"],
          termsVersion: "internal-terms",
          flagged: false,
          moderated: true,
          deletedAt: undefined,
          title: narrative,
          pros: undefined,
          cons: undefined,
          body: composeRelatoBody(narrative),
          response: {
            id: "response-1",
            reviewId: review.id,
            agencyId: ficha.id,
            body: "Gracias por contarlo.",
            createdAt: new Date("2026-02-01"),
          },
        },
      ],
      locations: [
        ...(ficha.locations ?? []),
        {
          id: "pending-location",
          agencyId: ficha.id,
          kind: "reported",
          status: "pendiente",
          address: "Calle secreta 1",
          city: "Madrid",
          postalCode: "28001",
          sourceUrl: "https://private.example/tip",
          note: "nota interna",
          createdAt: new Date("2026-01-01"),
        },
      ],
    });

    const serialized = JSON.stringify(detail);
    const keys = collectKeys(detail);
    for (const key of FORBIDDEN_KEYS) {
      expect(keys.has(key), key).toBe(false);
    }
    expect(serialized).not.toContain("user-secret-42");
    expect(serialized).not.toContain("secret.pdf");
    expect(serialized).not.toContain("motivo interno");
    expect(serialized).not.toContain("crime_accusation");
    expect(serialized).not.toContain("texto retenido");
    expect(serialized).not.toContain("fachada-relato");
    expect(serialized).not.toContain("600111222");
    expect(serialized).not.toContain("fachada.local");
    expect(serialized).not.toContain("private/logos");
    expect(serialized).not.toContain("internal-brand");
    expect(serialized).not.toContain("Calle secreta");
    expect(serialized).not.toContain("nota interna");
    expect(serialized).toContain(narrative);
    expect(detail.reviews[0]?.title).toBeUndefined();
    expect(detail.reviews[0]?.narrative).toBe(narrative);
    expect(detail.reviews[0]).not.toHaveProperty("body");
    expect(detail).not.toHaveProperty("averageRating");
    expect(detail.roleRatings).not.toHaveProperty("overall");
    expect(detail.roleRatings.inquilino).toHaveProperty("averageRating");
    expect(detail.phone).toBeUndefined();
  });

  it("does not leak internal fields from the public agency routes", async () => {
    const listed = await listAgencies(
      new Request("http://localhost/api/agencies"),
    );
    const one = await getAgency(new Request("http://localhost/api/agencies/x"), {
      params: Promise.resolve({ slug: "inmobiliaria-sol-madrid" }),
    });
    expect(listed.status).toBe(200);
    expect(one.status).toBe(200);
    const listedJson = await listed.json();
    const oneJson = await one.json();
    for (const payload of [listedJson, oneJson]) {
      const keys = collectKeys(payload);
      expect(keys.has("userId")).toBe(false);
      expect(keys.has("evidencePath")).toBe(false);
      expect(keys.has("moderationReason")).toBe(false);
      expect(keys.has("prefilterOutcome")).toBe(false);
      expect(keys.has("logoPath")).toBe(false);
      expect(keys.has("premium")).toBe(false);
      expect(keys.has("overall")).toBe(false);
    }
    const listedAgencies = listedJson.agencies as Array<Record<string, unknown>>;
    for (const agency of listedAgencies) {
      expect(agency).not.toHaveProperty("averageRating");
    }
    expect(oneJson.agency).not.toHaveProperty("averageRating");
    expect(JSON.stringify(oneJson)).not.toContain("fachada-relato");
  });
});

describe("archive public line", () => {
  it("names unique agencies, municipalities and published experiences", () => {
    expect(
      archivePublicLine({ agencies: 29, municipalities: 68, experiences: 3 }),
    ).toBe("29 inmobiliarias · 68 municipios · 3 experiencias publicadas");
    expect(
      archivePublicLine({ agencies: 1, municipalities: 1, experiences: 1 }),
    ).toBe("1 inmobiliaria · 1 municipio · 1 experiencia publicada");
  });
});
