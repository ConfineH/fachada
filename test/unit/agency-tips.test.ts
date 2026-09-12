import { describe, expect, it } from "vitest";

import { MemoryStore } from "@/lib/repositories/memory-store";
import { AgencyService } from "@/lib/services/agency-service";
import { AdminService } from "@/lib/services/admin-service";
import { AgencySubmissionService } from "@/lib/services/agency-submission-service";
import { AuthService } from "@/lib/services/auth-service";
import { ClaimService } from "@/lib/services/claim-service";
import { MockSmsProvider } from "@/lib/services/sms-provider";

async function verifiedUser(store: MemoryStore) {
  const sms = new MockSmsProvider();
  const auth = new AuthService(store, sms);
  await auth.requestCode("+34600111222");
  const session = await auth.verifyCode(
    "+34600111222",
    sms.lastCodeFor("+34600111222")!,
  );
  return auth.getUserFromSession(session.token);
}

describe("agency ficha tips", () => {
  it("keeps a suggested former name off the public ficha until approved", async () => {
    const store = new MemoryStore();
    const agencies = new AgencyService(store);
    const user = await verifiedUser(store);

    await agencies.submitTip(user, "inmobiliaria-sol-madrid", {
      kind: "former_name",
      alias: "Sol Gestión 2008",
      year: 2016,
      note: "Salía así en el contrato",
      sourceUrl: "https://www.idealista.com/pro/sol-gestion/",
    });

    const publicFicha = await agencies.getBySlug("inmobiliaria-sol-madrid", {
      publicOnly: true,
    });
    expect(
      publicFicha?.aliases.some((alias) => alias.alias === "Sol Gestión 2008"),
    ).toBe(false);

    const admin = new AdminService(
      store,
      new ClaimService(store),
      new AgencySubmissionService(store),
    );
    const pending = await admin.listPendingTips();
    expect(pending).toHaveLength(1);
    expect(pending[0]?.sourceUrl).toContain("idealista.com");

    await admin.approveTip(pending[0]!.id);

    const after = await agencies.getBySlug("inmobiliaria-sol-madrid", {
      publicOnly: true,
    });
    const former = after?.aliases.find((alias) => alias.alias === "Sol Gestión 2008");
    expect(former?.kind).toBe("former");
    expect(former?.effectiveUntil?.getUTCFullYear()).toBe(2016);
  });

  it("updates the principal office when a tip is approved", async () => {
    const store = new MemoryStore();
    const agencies = new AgencyService(store);
    const user = await verifiedUser(store);

    await agencies.submitTip(user, "inmobiliaria-sol-madrid", {
      kind: "principal",
      address: "Calle de Trafalgar 12",
      city: "Madrid",
      postalCode: "28010",
    });

    const before = await agencies.getBySlug("inmobiliaria-sol-madrid", {
      publicOnly: true,
    });
    expect(before?.address).toBe("Calle Mayor 12");

    const admin = new AdminService(
      store,
      new ClaimService(store),
      new AgencySubmissionService(store),
    );
    const pending = await admin.listPendingTips();
    await admin.approveTip(pending[0]!.id);

    const after = await agencies.getBySlug("inmobiliaria-sol-madrid", {
      publicOnly: true,
    });
    expect(after?.address).toBe("Calle de Trafalgar 12");
  });

  it("rejects an unverified sender", async () => {
    const store = new MemoryStore();
    const agencies = new AgencyService(store);
    await expect(
      agencies.submitTip(undefined, "inmobiliaria-sol-madrid", {
        kind: "branch",
        address: "Calle inventada 1",
        city: "Madrid",
      }),
    ).rejects.toThrow(/verification/i);
  });
});
