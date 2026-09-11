import { beforeEach, describe, expect, it } from "vitest";

import { MemoryStore } from "@/lib/repositories/memory-store";
import { AdminService } from "@/lib/services/admin-service";
import { AgencySubmissionService } from "@/lib/services/agency-submission-service";
import { ClaimService } from "@/lib/services/claim-service";
import { AgencyService } from "@/lib/services/agency-service";
import { MADRID_PILOT_AGENCIES, madridPilotSlug } from "@/lib/ops/madrid-pilot-catalog";

describe("Madrid pilot catalog", () => {
  it("has 25 unique Madrid slugs", () => {
    const slugs = MADRID_PILOT_AGENCIES.map((agency) =>
      madridPilotSlug(agency.name),
    );
    expect(slugs).toHaveLength(25);
    expect(new Set(slugs).size).toBe(25);
  });
});

describe("AdminService.createAgency", () => {
  let store: MemoryStore;
  let admin: AdminService;
  let agencies: AgencyService;

  beforeEach(() => {
    store = new MemoryStore();
    admin = new AdminService(
      store,
      new ClaimService(store),
      new AgencySubmissionService(store),
    );
    agencies = new AgencyService(store);
  });

  it("publishes a ficha with aliases for match", async () => {
    const agency = await admin.createAgency({
      name: "Inmobiliaria Norte",
      city: "Madrid",
      postalCode: "28004",
      address: "Calle de Fuencarral 10",
      noPhoneOnline: true,
      website: "https://norte.example",
      aliases: ["Norte Madrid", "Inmobiliaria Norte Chamberí"],
    });

    expect(agency.phonePublished).toBe(false);
    expect(agency.slug).toBe("inmobiliaria-norte-madrid");

    const match = await agencies.matchByName("Norte Madrid", "Madrid");
    expect(match?.slug).toBe(agency.slug);
  });

  it("rejects a duplicate name in the same city", async () => {
    await expect(
      admin.createAgency({
        name: "Inmobiliaria Sol",
        city: "Madrid",
        postalCode: "28013",
        address: "Plaza Mayor 1",
        noPhoneOnline: true,
      }),
    ).rejects.toThrow(/Ya existe/);
  });

  it("adds an alias by slug", async () => {
    await admin.addAlias({
      slug: "inmobiliaria-sol-madrid",
      alias: "Sol Chamberí",
    });
    const match = await agencies.matchByName("Sol Chamberí", "Madrid");
    expect(match?.slug).toBe("inmobiliaria-sol-madrid");
  });
});
