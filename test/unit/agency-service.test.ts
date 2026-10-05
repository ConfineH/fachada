import { beforeEach, describe, expect, it } from "vitest";

import { MemoryStore } from "@/lib/repositories/memory-store";
import { AgencyService } from "@/lib/services/agency-service";
import { GET } from "@/app/api/agencies/match/route";
import { REVIEW_TERMS_VERSION } from "@/lib/domain/review-authenticity";

const AUTHENTICITY_FIELDS = {
  experienceDate: new Date(),
  experienceType: "alquiler" as const,
  firstHandAttested: true,
  noIncentiveAttested: true,
  noConflictAttested: true,
  verificationLevel: "declarada" as const,
  identityVerification: "email" as const,
  termsVersion: REVIEW_TERMS_VERSION,
  termsAcceptedAt: new Date(),
};

describe("AgencyService.search", () => {
  let store: MemoryStore;
  let service: AgencyService;

  beforeEach(() => {
    store = new MemoryStore();
    service = new AgencyService(store);
  });

  it("filters agencies by city", async () => {
    const results = await service.search("Madrid");
    expect(results.length).toBe(2);
    expect(results.every((a) => a.city === "Madrid")).toBe(true);
  });

  it("filters agencies by name", async () => {
    const results = await service.search("Sol");
    expect(results).toHaveLength(1);
    expect(results[0]?.name).toBe("Inmobiliaria Sol");
  });

  it("sorts by average rating descending", async () => {
    const agencies = await store.listAgencies();
    const madrid = agencies.find((a) => a.name === "Inmobiliaria Sol")!;
    const other = agencies.find((a) => a.name === "Gestión Urbana")!;

    await store.createReview({
      ...AUTHENTICITY_FIELDS,
      id: crypto.randomUUID(),
      userId: crypto.randomUUID(),
      agencyId: madrid.id,
      role: "inquilino",
      rating: 5,
      title: "Excelente",
      body: "Muy buena gestión en general.",
      anonymous: true,
      helpfulCount: 0,
      incidentTags: ["comunicacion"],
      incidentSentiments: {},
      createdAt: new Date(),
      moderated: true,
      flagged: false,
    });

    await store.createReview({
      ...AUTHENTICITY_FIELDS,
      id: crypto.randomUUID(),
      userId: crypto.randomUUID(),
      agencyId: other.id,
      role: "propietario",
      rating: 2,
      title: "Regular",
      body: "La comunicación podría mejorar bastante.",
      anonymous: true,
      helpfulCount: 0,
      incidentTags: ["comunicacion"],
      incidentSentiments: {},
      createdAt: new Date(),
      moderated: true,
      flagged: false,
    });

    const results = await service.search("Madrid", { sort: "overall" });
    expect(results[0]?.name).toBe("Inmobiliaria Sol");
  });
});

describe("AgencyService.exploreCities", () => {
  it("lists cities with agency and review counts", async () => {
    const store = new MemoryStore();
    const service = new AgencyService(store);
    const cities = await service.exploreCities({ publicOnly: true });
    expect(cities.length).toBeGreaterThanOrEqual(3);
    const madrid = cities.find((c) => c.slug === "madrid");
    expect(madrid?.agencyCount).toBe(2);
  });
});

describe("AgencyService.matchByName", () => {
  it("matches commercial name with confidence", async () => {
    const store = new MemoryStore();
    const service = new AgencyService(store);
    const match = await service.matchByName("Inmobiliaria Sol", "Madrid", {
      publicOnly: true,
    });
    expect(match?.slug).toBe("inmobiliaria-sol-madrid");
    expect(match!.confidence).toBeGreaterThan(0.8);
  });

  it("matches alias names", async () => {
    const store = new MemoryStore();
    const service = new AgencyService(store);
    const match = await service.matchByName("Sol Inmobiliaria Madrid", undefined, {
      publicOnly: true,
    });
    expect(match?.agency.name).toBe("Inmobiliaria Sol");
    expect(match?.matchedOn).toBe("Sol Inmobiliaria Madrid");
  });
});

describe("AgencyService presence", () => {
  it("lists one company in every city where it has an office", async () => {
    const store = new MemoryStore();
    const service = new AgencyService(store);
    const sol = (await store.listAgencies()).find((agency) => agency.slug === "inmobiliaria-sol-madrid")!;

    await store.createLocation({
      id: crypto.randomUUID(),
      agencyId: sol.id,
      kind: "branch",
      status: "publicado",
      address: "Oficina en Barcelona",
      city: "Barcelona",
      postalCode: "08001",
      createdAt: new Date(),
    });

    const barcelona = await service.listByCity("barcelona");
    const registry = await service.search("Sol");
    expect(barcelona.some((agency) => agency.id === sol.id)).toBe(true);
    expect(registry).toHaveLength(1);
    expect(registry[0]?.presenceCities).toEqual(["Madrid", "Barcelona"]);
  });

  it("sums a brand only when the CIFs differ", async () => {
    const store = new MemoryStore();
    const service = new AgencyService(store);
    const [first, second] = await store.listAgencies();
    first!.brandSlug = "red";
    first!.brandName = "Red";
    first!.cif = "A11111111";
    second!.brandSlug = "red";
    second!.brandName = "Red";
    second!.cif = "B22222222";

    const rollup = await service.brandRollup(first!);
    expect(rollup?.companyCount).toBe(2);
    expect(rollup?.brandName).toBe("Red");

    second!.cif = "A11111111";
    expect(await service.brandRollup(first!)).toBeNull();
  });
});

describe("AgencyService.updatePublicProfile", () => {
  it("updates portal urls and adds an alias", async () => {
    const store = new MemoryStore();
    const service = new AgencyService(store);
    const updated = await service.updatePublicProfile("inmobiliaria-sol-madrid", {
      website: "https://sol.example",
      idealistaUrl: "https://www.idealista.com/agencia/sol",
      alias: "Sol Madrid Prime",
    });

    expect(updated?.website).toBe("https://sol.example");
    expect(updated?.idealistaUrl).toContain("idealista.com");
    expect(updated?.aliases.some((a) => a.alias === "Sol Madrid Prime")).toBe(
      true,
    );
  });
});

describe("GET /api/agencies/match", () => {
  it("returns 400 without name", async () => {
    const res = await GET(new Request("http://localhost/api/agencies/match"));
    expect(res.status).toBe(400);
  });
});
