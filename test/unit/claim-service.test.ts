import { beforeEach, describe, expect, it } from "vitest";

import { MemoryStore } from "@/lib/repositories/memory-store";
import { AdminService } from "@/lib/services/admin-service";
import { AuthService } from "@/lib/services/auth-service";
import { ClaimError, ClaimService } from "@/lib/services/claim-service";
import { ReviewService } from "@/lib/services/review-service";
import { MockSmsProvider } from "@/lib/services/sms-provider";

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
    claimService = new ClaimService(store);
    adminService = new AdminService(store, claimService);
    reviewService = new ReviewService(store);
    agencyId = (await store.listAgencies())[0]!.id;
  });

  async function verifiedUser(phone = "+34600333444") {
    await auth.requestCode(phone);
    const code = sms.lastCodeFor(phone)!;
    const session = await auth.verifyCode(phone, code);
    return auth.getUserFromSession(session.token);
  }

  async function verifiedOwner(phone = "+34600333444") {
    const user = await verifiedUser(phone);
    const claim = await claimService.submit(user, {
      agencyId,
      contactName: "Ana García",
      contactEmail: "ana@inmobiliaria.es",
      contactPhone: phone,
      documentationUrls: ["https://example.com/cif.pdf"],
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
      body: "La gestión fue rápida y clara en todo momento.",
    });
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
