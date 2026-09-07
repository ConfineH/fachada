import { beforeEach, describe, expect, it } from "vitest";

import { MemoryStore } from "@/lib/repositories/memory-store";
import { AdminService } from "@/lib/services/admin-service";
import { AgencySubmissionService } from "@/lib/services/agency-submission-service";
import { AuthService } from "@/lib/services/auth-service";
import { ClaimService } from "@/lib/services/claim-service";
import { MockSmsProvider } from "@/lib/services/sms-provider";

describe("AgencySubmissionService", () => {
  let store: MemoryStore;
  let auth: AuthService;
  let sms: MockSmsProvider;
  let submissionService: AgencySubmissionService;
  let adminService: AdminService;

  beforeEach(() => {
    store = new MemoryStore();
    sms = new MockSmsProvider();
    auth = new AuthService(store, sms);
    const claimService = new ClaimService(store);
    submissionService = new AgencySubmissionService(store);
    adminService = new AdminService(store, claimService, submissionService);
  });

  async function verifiedUser(phone = "+34600777888") {
    await auth.requestCode(phone);
    const code = sms.lastCodeFor(phone)!;
    const session = await auth.verifyCode(phone, code);
    return auth.getUserFromSession(session.token);
  }

  it("creates pending submission", async () => {
    const user = await verifiedUser();
    const submission = await submissionService.submit(user, {
      name: "Inmobiliaria Nueva",
      city: "Sevilla",
      postalCode: "41001",
      address: "Calle Sierpes 1",
      noPhoneOnline: false,
      phone: "+34954111222",
    });

    expect(submission.status).toBe("pendiente");
    const pending = await adminService.listPendingAgencySubmissions();
    expect(pending).toHaveLength(1);
  });

  it("publishes agency on admin approve", async () => {
    const user = await verifiedUser();
    const submission = await submissionService.submit(user, {
      name: "Inmobiliaria Nueva",
      city: "Sevilla",
      postalCode: "41001",
      address: "Calle Sierpes 1",
      noPhoneOnline: false,
      phone: "+34954111222",
    });

    const agency = await adminService.approveAgencySubmission(submission.id);
    expect(agency.slug).toContain("inmobiliaria-nueva");
    expect(agency.city).toBe("Sevilla");

    const found = await store.findAgencyBySlug(agency.slug);
    expect(found?.name).toBe("Inmobiliaria Nueva");
  });

  it("publishes agency without phone when marked noPhoneOnline", async () => {
    const user = await verifiedUser("+34600888999");
    const submission = await submissionService.submit(user, {
      name: "Inmobiliaria Opaca",
      city: "Málaga",
      postalCode: "29001",
      address: "Calle Larios 5",
      noPhoneOnline: true,
      idealistaUrl: "https://www.idealista.com/pro/ejemplo/",
    });

    const agency = await adminService.approveAgencySubmission(submission.id);
    expect(agency.phonePublished).toBe(false);
    expect(agency.phone).toBe("");
    expect(agency.email).toBe("");
  });
});
