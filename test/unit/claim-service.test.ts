import { beforeEach, describe, expect, it } from "vitest";

import { MemoryStore } from "@/lib/repositories/memory-store";
import { AuthService } from "@/lib/services/auth-service";
import { ClaimService } from "@/lib/services/claim-service";
import { MockSmsProvider } from "@/lib/services/sms-provider";

describe("ClaimService", () => {
  let store: MemoryStore;
  let auth: AuthService;
  let sms: MockSmsProvider;
  let service: ClaimService;
  let agencyId: string;

  beforeEach(() => {
    store = new MemoryStore();
    sms = new MockSmsProvider();
    auth = new AuthService(store, sms);
    service = new ClaimService(store);
    agencyId = store.listAgencies()[0]!.id;
  });

  async function verifiedUser(phone = "+34600333444") {
    await auth.requestCode(phone);
    const code = sms.lastCodeFor(phone)!;
    const session = auth.verifyCode(phone, code);
    return auth.getUserFromSession(session.token)!;
  }

  it("submits claim for verified user", async () => {
    const user = await verifiedUser();
    const claim = service.submit(user, {
      agencyId,
      contactName: "Ana García",
      contactEmail: "ana@inmobiliaria.es",
      contactPhone: "+34600333444",
      documentationUrls: ["https://example.com/cif.pdf"],
    });

    expect(claim.status).toBe("pendiente");
  });

  it("approves claim and marks agency verified", async () => {
    const user = await verifiedUser();
    const claim = service.submit(user, {
      agencyId,
      contactName: "Ana García",
      contactEmail: "ana@inmobiliaria.es",
      contactPhone: "+34600333444",
      documentationUrls: ["https://example.com/cif.pdf"],
    });

    service.approve(claim.id);
    const agency = store.findAgencyById(agencyId);
    expect(agency?.verified).toBe(true);
    expect(agency?.claimed).toBe(true);
  });
});
