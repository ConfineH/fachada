import { beforeEach, describe, expect, it } from "vitest";

import { MemoryStore } from "@/lib/repositories/memory-store";
import { AgencyService } from "@/lib/services/agency-service";

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
      createdAt: new Date(),
      moderated: true,
      flagged: false,
    });

    const results = await service.search("Madrid");
    expect(results[0]?.name).toBe("Inmobiliaria Sol");
  });
});
