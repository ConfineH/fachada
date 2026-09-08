import { beforeEach, describe, expect, it } from "vitest";

import { MemoryStore } from "@/lib/repositories/memory-store";
import { AgencySubmissionService } from "@/lib/services/agency-submission-service";
import { AdminService } from "@/lib/services/admin-service";
import { AuthService } from "@/lib/services/auth-service";
import { ClaimError, ClaimService } from "@/lib/services/claim-service";
import { ReviewService } from "@/lib/services/review-service";
import { MockSmsProvider } from "@/lib/services/sms-provider";

const validClaimPayload = {
  contactName: "Ana García",
  contactEmail: "ana@inmobiliariasol.es",
  contactPhone: "+34600333444",
  representativeRole: "administrador" as const,
  companyCif: "B12345678",
  evidence: [
    {
      type: "cif_document" as const,
      url: "https://example.com/cif.pdf",
    },
  ],
  attestationAccepted: true as const,
};

describe("ClaimService and AdminService", () => {
  let store: MemoryStore;
  let auth: AuthService;
  let sms: MockSmsProvider;
  let claimService: ClaimService;
  let adminService: AdminService;
  let reviewService: ReviewService;
  let agencyId: string;

  beforeEach(async () => {
    store = new MemoryStore();
    sms = new MockSmsProvider();
    auth = new AuthService(store, sms);
    claimService = new ClaimService(store, true);
    const submissionService = new AgencySubmissionService(store);
    adminService = new AdminService(store, claimService, submissionService);
    reviewService = new ReviewService(store);
    agencyId = (await store.listAgencies())[0]!.id;
  });

  async function verifiedUser(phone = "+34600333444") {
    await auth.requestCode(phone);
    const code = sms.lastCodeFor(phone)!;
    const session = await auth.verifyCode(phone, code);
    return auth.getUserFromSession(session.token);
  }

  async function verifyBusinessLine(userId: string) {
    const agency = await store.findAgencyById(agencyId);
    await auth.requestAgencyBusinessCode(userId, agencyId);
    const code = sms.lastCodeFor(agency!.phone)!;
    await auth.verifyAgencyBusinessCode(userId, agencyId, code);
  }

  async function verifiedOwner(phone = "+34600333444") {
    const user = await verifiedUser(phone);
    await verifyBusinessLine(user!.id);
    const claim = await claimService.submit(user, {
      agencyId,
      ...validClaimPayload,
    });
    await adminService.approveClaim(claim.id);
    return user;
  }

  async function createReviewForAgency() {
    const reviewer = await verifiedUser("+34600111222");
    return reviewService.create(reviewer, {
      agencyId,
      role: "inquilino",
      rating: 4,
      title: "Buena experiencia",
      pros: "La gestión fue rápida y clara en todo momento.",
      cons: "Mejoraría la velocidad al contestar emails.",
    });
  }

  it("submits claim for verified user with business line and evidence", async () => {
    const user = await verifiedUser();
    await verifyBusinessLine(user!.id);
    const claim = await claimService.submit(user, {
      agencyId,
      ...validClaimPayload,
    });

    expect(claim.status).toBe("pendiente");
    expect(claim.businessPhoneVerified).toBe(true);
    expect(claim.workEmailDomainMatch).toBe(true);
  });

  it("rejects claim without business phone verification", async () => {
    const user = await verifiedUser();
    await expect(
      claimService.submit(user, { agencyId, ...validClaimPayload }),
    ).rejects.toThrow(ClaimError);
  });

  it("rejects claim with personal email", async () => {
    const user = await verifiedUser();
    await verifyBusinessLine(user!.id);
    await expect(
      claimService.submit(user, {
        agencyId,
        ...validClaimPayload,
        contactEmail: "ana@gmail.com",
      }),
    ).rejects.toThrow(/corporativo/i);
  });

  it("approves claim and marks agency verified", async () => {
    const user = await verifiedUser();
    await verifyBusinessLine(user!.id);
    const claim = await claimService.submit(user, {
      agencyId,
      ...validClaimPayload,
    });

    await adminService.approveClaim(claim.id);
    const agency = await store.findAgencyById(agencyId);
    expect(agency?.verified).toBe(true);
    expect(agency?.claimed).toBe(true);
  });

  it("lists pending claims for admin", async () => {
    const user = await verifiedUser();
    await verifyBusinessLine(user!.id);
    await claimService.submit(user, { agencyId, ...validClaimPayload });

    const pending = await adminService.listPendingClaims();
    expect(pending).toHaveLength(1);
    expect(pending[0]?.agencyName).toBe("Inmobiliaria Sol");
  });

  it("responds to review when user owns approved claim", async () => {
    const owner = await verifiedOwner();
    const review = await createReviewForAgency();

    const response = await claimService.respond(owner, agencyId, {
      reviewId: review.id,
      body: "Gracias por tu feedback. Seguimos mejorando nuestro servicio.",
    });

    expect(response.reviewId).toBe(review.id);
    expect(response.agencyId).toBe(agencyId);
  });

  it("rejects response from non-owner", async () => {
    await verifiedOwner();
    const outsider = await verifiedUser("+34600555666");
    const review = await createReviewForAgency();

    await expect(
      claimService.respond(outsider, agencyId, {
        reviewId: review.id,
        body: "Intento no autorizado de responder.",
      }),
    ).rejects.toThrow(ClaimError);
  });

  it("rejects duplicate response for same review", async () => {
    const owner = await verifiedOwner();
    const review = await createReviewForAgency();

    await claimService.respond(owner, agencyId, {
      reviewId: review.id,
      body: "Primera respuesta oficial de la agencia.",
    });

    await expect(
      claimService.respond(owner, agencyId, {
        reviewId: review.id,
        body: "Segunda respuesta que no debería permitirse.",
      }),
    ).rejects.toThrow(/already has a response/);
  });
});
