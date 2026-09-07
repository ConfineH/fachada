import { beforeEach, describe, expect, it } from "vitest";

import { MemoryStore } from "@/lib/repositories/memory-store";
import { AgencyService } from "@/lib/services/agency-service";
import { GET } from "@/app/api/agencies/match/route";

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
      id: crypto.randomUUID(),
      userId: crypto.randomUUID(),
      agencyId: madrid.id,
      role: "inquilino",
      rating: 5,
      title: "Excelente",
      body: "Muy buena gestión en general.",
      incidentTags: ["comunicacion"],
      createdAt: new Date(),
      moderated: true,
      flagged: false,
    });

    await store.createReview({
      id: crypto.randomUUID(),
      userId: crypto.randomUUID(),
      agencyId: other.id,
      role: "propietario",
      rating: 2,
      title: "Regular",
      body: "La comunicación podría mejorar bastante.",
      incidentTags: ["comunicacion"],
      createdAt: new Date(),
      moderated: true,
      flagged: false,
    });

    const results = await service.search("Madrid");
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
