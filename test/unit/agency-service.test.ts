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

  it("counts visible reviews in one read and only in the city they name", async () => {
    const store = new MemoryStore();
    let perAgency = 0;
    let visibilityReads = 0;
    const originalPerAgency = store.listReviewsByAgency.bind(store);
    const originalVisibility = store.listReviewVisibility.bind(store);
    store.listReviewsByAgency = async (agencyId: string) => {
      perAgency += 1;
      return originalPerAgency(agencyId);
    };
    store.listReviewVisibility = async () => {
      visibilityReads += 1;
      return originalVisibility();
    };

    const service = new AgencyService(store);
    const before = await service.exploreCities({ publicOnly: true });
    const sol = (await store.listAgencies()).find(
      (agency) => agency.slug === "inmobiliaria-sol-madrid",
    )!;
    const [sample] = await store.listAllReviews();
    await store.createReview({
      ...sample!,
      id: crypto.randomUUID(),
      agencyId: sol.id,
      moderated: false,
      flagged: false,
      deletedAt: undefined,
    });
    await store.createReview({
      ...sample!,
      id: crypto.randomUUID(),
      agencyId: sol.id,
      moderated: true,
      flagged: true,
      deletedAt: undefined,
    });
    await store.createReview({
      ...sample!,
      id: crypto.randomUUID(),
      agencyId: sol.id,
      moderated: true,
      flagged: false,
      deletedAt: new Date(),
    });
    await store.createLocation({
      id: crypto.randomUUID(),
      agencyId: sol.id,
      kind: "branch",
      status: "publicado",
      address: "Oficina en Sevilla",
      city: "Sevilla",
      postalCode: "41001",
      createdAt: new Date(),
    });

    perAgency = 0;
    visibilityReads = 0;
    const cities = await service.exploreCities({ publicOnly: true });
    const madridBefore = before.find((city) => city.slug === "madrid")!;
    const madrid = cities.find((city) => city.slug === "madrid")!;
    const sevilla = cities.find((city) => city.slug === "sevilla")!;
    const publicSolReviews = (await originalPerAgency(sol.id)).filter(
      (review) => review.moderated && !review.flagged && !review.deletedAt,
    );

    expect(perAgency).toBe(0);
    expect(visibilityReads).toBe(1);
    expect(madrid.reviewCount).toBe(madridBefore.reviewCount);
    expect(sevilla.agencyCount).toBe(1);
    expect(sevilla.reviewCount).toBe(0);
    expect(publicSolReviews.every((review) => !review.experienceCity?.trim())).toBe(
      true,
    );
  });

  it("counts one agency in several municipalities without copying its experiences", async () => {
    const store = new MemoryStore();
    const service = new AgencyService(store);
    const sol = (await store.listAgencies()).find(
      (agency) => agency.slug === "inmobiliaria-sol-madrid",
    )!;
    const [sample] = await store.listAllReviews();
    await store.createLocation({
      id: crypto.randomUUID(),
      agencyId: sol.id,
      kind: "branch",
      status: "publicado",
      address: "Oficina en Sevilla",
      city: "Sevilla",
      postalCode: "41001",
      createdAt: new Date(),
    });
    await store.createReview({
      ...sample!,
      id: crypto.randomUUID(),
      agencyId: sol.id,
      moderated: true,
      flagged: false,
      deletedAt: undefined,
      experienceCity: "Madrid",
    });
    await store.createReview({
      ...sample!,
      id: crypto.randomUUID(),
      agencyId: sol.id,
      moderated: true,
      flagged: false,
      deletedAt: undefined,
      experienceCity: undefined,
    });

    const totals = await service.archiveTotals({ publicOnly: true });
    const cities = await service.exploreCities({ publicOnly: true });
    const madrid = cities.find((city) => city.slug === "madrid")!;
    const sevilla = cities.find((city) => city.slug === "sevilla")!;
    const presenceSum = cities.reduce((sum, city) => sum + city.agencyCount, 0);
    const namedSum = cities.reduce((sum, city) => sum + city.reviewCount, 0);

    expect(totals.agencies).toBe((await store.listAgencies()).length);
    expect(totals.municipalities).toBe(cities.length);
    expect(presenceSum).toBeGreaterThan(totals.agencies);
    expect(sevilla.agencyCount).toBe(1);
    expect(sevilla.reviewCount).toBe(0);
    expect(madrid.reviewCount).toBe(1);
    expect(namedSum).toBe(1);
    expect(totals.experiences).toBeGreaterThan(namedSum);
  });
});

describe("AgencyService.matchByName", () => {
  it("matches commercial name with confidence", async () => {
    const store = new MemoryStore();
    const service = new AgencyService(store);
    const match = await service.matchByName("Inmobiliaria Sol", "Madrid", {
      publicOnly: true,
    });
    expect(match.identified.map((hit) => hit.slug)).toEqual([
      "inmobiliaria-sol-madrid",
    ]);
    expect(match.identified[0]?.band).toBe("exact");
    expect(match.hints).toEqual([]);
  });

  it("matches alias names without dropping the other candidates", async () => {
    const store = new MemoryStore();
    const service = new AgencyService(store);
    const match = await service.matchByName("Sol Inmobiliaria Madrid", undefined, {
      publicOnly: true,
    });
    expect(match.identified).toHaveLength(1);
    expect(match.identified[0]?.agency.name).toBe("Inmobiliaria Sol");
    expect(match.identified[0]?.matchedOn).toBe("Sol Inmobiliaria Madrid");
    expect(match.hints).toEqual([]);
  });

  it("recognizes a city label and not a commercial name", async () => {
    const store = new MemoryStore();
    const service = new AgencyService(store);
    await expect(service.namesACity("Madrid")).resolves.toBe(true);
    await expect(service.namesACity("Inmobiliaria Sol")).resolves.toBe(false);
    const cityQuery = await service.matchByName("Madrid");
    expect(cityQuery.identified).toEqual([]);
    expect(cityQuery.hints).toEqual([]);
  });

  it("finds an agency by a commercial alias", async () => {
    const store = new MemoryStore();
    const service = new AgencyService(store);
    const results = await service.search("Sol Gestión");
    expect(results.map((agency) => agency.slug)).toContain("inmobiliaria-sol-madrid");
  });

  it("keeps two similar names side by side", async () => {
    const store = new MemoryStore();
    const service = new AgencyService(store);
    const created = new Date();
    await store.createAgency({
      id: crypto.randomUUID(),
      slug: "patio-sur",
      name: "Patio Sur",
      address: "Calle 1",
      city: "Madrid",
      postalCode: "28001",
      phone: "",
      phonePublished: false,
      email: "",
      claimed: false,
      verified: false,
      premium: false,
      createdAt: created,
    });
    await store.createAgency({
      id: crypto.randomUUID(),
      slug: "patio-sur-gestion",
      name: "Patio Sur Gestión",
      address: "Calle 2",
      city: "Barcelona",
      postalCode: "08001",
      phone: "",
      phonePublished: false,
      email: "",
      claimed: false,
      verified: false,
      premium: false,
      createdAt: created,
    });
    const match = await service.matchByName("Patio Sur");
    expect(match.identified.map((hit) => hit.slug).sort()).toEqual([
      "patio-sur",
      "patio-sur-gestion",
    ]);
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
