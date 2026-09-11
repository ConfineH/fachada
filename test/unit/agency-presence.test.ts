import { describe, expect, it } from "vitest";

import {
  isConfirmedStreetAddress,
  publicStreetLine,
} from "@/lib/domain/agency-presence";
import { MemoryStore } from "@/lib/repositories/memory-store";
import { AgencyService } from "@/lib/services/agency-service";
import { AdminService } from "@/lib/services/admin-service";
import { AgencySubmissionService } from "@/lib/services/agency-submission-service";
import { AuthService } from "@/lib/services/auth-service";
import { ClaimService } from "@/lib/services/claim-service";
import { MockSmsProvider } from "@/lib/services/sms-provider";

describe("agency presence copy", () => {
  it("does not treat placeholder HQ as a street", () => {
    expect(isConfirmedStreetAddress("Oficina en Madrid")).toBe(false);
    expect(isConfirmedStreetAddress("Calle de Castelló 55")).toBe(true);
    expect(
      publicStreetLine({
        address: "Oficina en Madrid",
        city: "Madrid",
        postalCode: "28001",
      }),
    ).toContain("Ubicación por confirmar");
  });
});

describe("ficha locations and history", () => {
  it("shows published extra offices and former names", async () => {
    const store = new MemoryStore();
    const service = new AgencyService(store);
    const ficha = await service.getBySlug("inmobiliaria-sol-madrid", {
      publicOnly: true,
    });

    expect(ficha?.locations.some((item) => item.address.includes("Trafalgar"))).toBe(
      true,
    );
    expect(ficha?.aliases.some((alias) => alias.kind === "former")).toBe(true);
  });

  it("keeps suggested locations off the public ficha until published", async () => {
    const store = new MemoryStore();
    const sms = new MockSmsProvider();
    const auth = new AuthService(store, sms);
    const service = new AgencyService(store);

    await auth.requestCode("+34600111222");
    const session = await auth.verifyCode("+34600111222", sms.lastCodeFor("+34600111222")!);
    const user = await auth.getUserFromSession(session.token);

    await service.suggestLocation(user, "inmobiliaria-sol-madrid", {
      address: "Calle inventada 1",
      city: "Madrid",
      postalCode: "28004",
      note: "La vi al pasar",
    });

    const publicFicha = await service.getBySlug("inmobiliaria-sol-madrid", {
      publicOnly: true,
    });
    expect(
      publicFicha?.locations.some((item) => item.address.includes("inventada")),
    ).toBe(false);

    const admin = new AdminService(
      store,
      new ClaimService(store),
      new AgencySubmissionService(store),
    );
    const pending = await admin.listPendingLocations();
    expect(pending).toHaveLength(1);
    await admin.publishLocation(pending[0]!.id);

    const after = await service.getBySlug("inmobiliaria-sol-madrid", {
      publicOnly: true,
    });
    expect(after?.locations.some((item) => item.address.includes("inventada"))).toBe(
      true,
    );
  });

  it("still matches a former trading name", async () => {
    const store = new MemoryStore();
    const service = new AgencyService(store);
    const match = await service.matchByName("Sol Gestión", "Madrid");
    expect(match?.slug).toBe("inmobiliaria-sol-madrid");
  });
});
