import { beforeEach, describe, expect, it } from "vitest";

import { agencyPlaceKey } from "@/lib/domain/agency-identity";
import { REVIEW_TERMS_VERSION } from "@/lib/domain/review-authenticity";
import { isPublicReview } from "@/lib/domain/review-visibility";
import { MemoryStore } from "@/lib/repositories/memory-store";
import { AdminService } from "@/lib/services/admin-service";
import { AgencySubmissionService } from "@/lib/services/agency-submission-service";
import { ClaimService } from "@/lib/services/claim-service";
import { ProvisionalAgencyService } from "@/lib/services/provisional-agency-service";
import { ReviewError, ReviewService } from "@/lib/services/review-service";

const PROS = "La gestión fue rápida y clara en todo momento.";
const CONS = "Algún retraso menor contestando correos por la tarde.";

describe("provisional agency from a review", () => {
  let store: MemoryStore;
  let service: ProvisionalAgencyService;
  let admin: AdminService;

  beforeEach(() => {
    store = new MemoryStore();
    const reviews = new ReviewService(store);
    service = new ProvisionalAgencyService(store, reviews);
    admin = new AdminService(
      store,
      new ClaimService(store, false),
      new AgencySubmissionService(store),
    );
  });

  async function author() {
    const user = await store.createUser({ email: "ana@gmail.com" });
    user.emailVerified = true;
    await store.updateUser(user);
    return user;
  }

  function payload(overrides: Record<string, unknown> = {}) {
    return {
      name: "Fincas del Río",
      city: "Madrid",
      address: "Calle de Atocha 10",
      role: "inquilino",
      rating: 3,
      title: "Tardaron con la fianza",
      pros: PROS,
      cons: CONS,
      experienceDate: new Date().toISOString().slice(0, 10),
      experienceType: "alquiler",
      experienceCity: "Madrid",
      firstHandAttested: true,
      noIncentiveAttested: true,
      noConflictAttested: true,
      termsAccepted: true,
      termsVersion: REVIEW_TERMS_VERSION,
      ...overrides,
    };
  }

  it("normalizes name and city for dedup", () => {
    expect(agencyPlaceKey("  Fincas   García ", "Málaga")).toBe(
      agencyPlaceKey("fincas garcia", "malaga"),
    );
  });

  it("publishes the review on a provisional ficha", async () => {
    const user = await author();
    const before = (await store.listAgencies()).length;
    const result = await service.publishWithReview(user, payload());

    expect(result.createdAgency).toBe(true);
    expect(result.agency.provisional).toBe(true);
    expect(result.agency.address).toBe("Calle de Atocha 10");
    expect(result.review.moderated).toBe(true);
    expect(isPublicReview(result.review)).toBe(true);
    expect((await store.listAgencies()).length).toBe(before + 1);
  });

  it("hides the street when the address is missing", async () => {
    const user = await author();
    const result = await service.publishWithReview(
      user,
      payload({ address: "" }),
    );
    expect(result.agency.address).toBe("");
    expect(result.agency.provisional).toBe(true);
  });

  it("attaches the review to the existing ficha instead of duplicating", async () => {
    const user = await author();
    const before = (await store.listAgencies()).length;
    const result = await service.publishWithReview(
      user,
      payload({
        name: "  inmobiliaria   sol ",
        city: "madrid",
        address: "",
      }),
    );

    expect(result.createdAgency).toBe(false);
    expect(result.agency.slug).toBe("inmobiliaria-sol-madrid");
    expect(result.agency.provisional).toBeUndefined();
    expect((await store.listAgencies()).length).toBe(before);
    expect(result.review.agencyId).toBe(result.agency.id);
  });

  it("does not create a ficha when the text has a phone", async () => {
    const user = await author();
    const before = (await store.listAgencies()).length;
    await expect(
      service.publishWithReview(
        user,
        payload({
          name: "Agencia Teléfono",
          cons: "Llamad al 600 111 222 y lo explico con calma.",
        }),
      ),
    ).rejects.toBeInstanceOf(ReviewError);
    expect((await store.listAgencies()).length).toBe(before);
  });

  it("keeps an estafa accusation off the public ficha", async () => {
    const user = await author();
    const result = await service.publishWithReview(
      user,
      payload({
        name: "Agencia Retenida",
        cons: "Fue una estafa con la fianza y no devolvieron nada.",
      }),
    );

    expect(result.agency.provisional).toBe(true);
    expect(result.review.moderated).toBe(false);
    expect(isPublicReview(result.review)).toBe(false);
    expect(result.review.prefilterCodes).toContain("crime_accusation");
  });

  it("lets admin verify and merge a provisional ficha", async () => {
    const user = await author();
    const created = await service.publishWithReview(
      user,
      payload({ name: "Oficina Norte", city: "Madrid" }),
    );
    const verified = await admin.verifyProvisionalAgency(created.agency.id);
    expect(verified.provisional).toBe(false);

    const second = await service.publishWithReview(
      user,
      payload({
        name: "Oficina Duplicada",
        city: "Valencia",
        title: "Otra experiencia distinta",
      }),
    );
    const target = created.agency;
    const merged = await admin.mergeProvisionalAgency(second.agency.id, target.slug);
    expect(merged.id).toBe(target.id);
    expect(await store.findAgencyById(second.agency.id)).toBeNull();
    expect(await store.findAgencyIdByLegacySlug(second.agency.slug)).toBe(target.id);
    const reviews = await store.listReviewsByAgency(target.id);
    expect(reviews.some((review) => review.id === second.review.id)).toBe(true);
  });
});
