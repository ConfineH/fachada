import { beforeEach, describe, expect, it } from "vitest";

import { MemoryStore } from "@/lib/repositories/memory-store";
import { AdminService } from "@/lib/services/admin-service";
import { AuthService } from "@/lib/services/auth-service";
import { ClaimService } from "@/lib/services/claim-service";
import { MockSmsProvider } from "@/lib/services/sms-provider";

describe("ClaimService and AdminService", () => {
  let store: MemoryStore;
  let auth: AuthService;
  let sms: MockSmsProvider;
  let claimService: ClaimService;
  let adminService: AdminService;
  let agencyId: string;

  beforeEach(async () => {
    store = new MemoryStore();
    sms = new MockSmsProvider();
    auth = new AuthService(store, sms);
    claimService = new ClaimService(store);
    adminService = new AdminService(store, claimService);
    agencyId = (await store.listAgencies())[0]!.id;
  });

  async function verifiedUser(phone = "+34600333444") {
    await auth.requestCode(phone);
    const code = sms.lastCodeFor(phone)!;
    const session = await auth.verifyCode(phone, code);
    return auth.getUserFromSession(session.token);
  }

  it("submits claim for verified user", async () => {
    const user = await verifiedUser();
    const claim = await claimService.submit(user, {
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
    const claim = await claimService.submit(user, {
      agencyId,
      contactName: "Ana García",
      contactEmail: "ana@inmobiliaria.es",
      contactPhone: "+34600333444",
      documentationUrls: ["https://example.com/cif.pdf"],
    });

    await adminService.approveClaim(claim.id);
    const agency = await store.findAgencyById(agencyId);
    expect(agency?.verified).toBe(true);
    expect(agency?.claimed).toBe(true);
  });

  it("lists pending claims for admin", async () => {
    const user = await verifiedUser();
    await claimService.submit(user, {
      agencyId,
      contactName: "Ana García",
      contactEmail: "ana@inmobiliaria.es",
      contactPhone: "+34600333444",
      documentationUrls: ["https://example.com/cif.pdf"],
    });

    const pending = await adminService.listPendingClaims();
    expect(pending).toHaveLength(1);
    expect(pending[0]?.agencyName).toBe("Inmobiliaria Sol");
  });
});
