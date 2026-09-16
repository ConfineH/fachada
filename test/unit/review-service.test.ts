import { beforeEach, describe, expect, it } from "vitest";

import { MemoryStore } from "@/lib/repositories/memory-store";
import { AgencyService } from "@/lib/services/agency-service";
import { AuthService } from "@/lib/services/auth-service";
import { ReviewError, ReviewService } from "@/lib/services/review-service";
import { MockSmsProvider } from "@/lib/services/sms-provider";
import { REVIEW_TERMS_VERSION } from "@/lib/domain/review-authenticity";

const PROS = "La gestión fue rápida y clara en todo momento.";
const CONS = "Algún retraso menor contestando correos por la tarde.";

describe("ReviewService", () => {
  let store: MemoryStore;
  let auth: AuthService;
  let sms: MockSmsProvider;
  let service: ReviewService;
  let agencyId: string;

  beforeEach(async () => {
    store = new MemoryStore();
    sms = new MockSmsProvider();
    auth = new AuthService(store, sms);
    service = new ReviewService(store);
    agencyId = (await store.listAgencies())[0]!.id;
  });

  async function verifiedUser(phone = "+34600111222") {
    await auth.requestCode(phone);
    const code = sms.lastCodeFor(phone)!;
    const session = await auth.verifyCode(phone, code);
    return auth.getUserFromSession(session.token);
  }

  function payload(overrides: Record<string, unknown> = {}) {
    return {
      agencyId,
      role: "inquilino",
      rating: 4,
      title: "Buena experiencia",
      pros: PROS,
      cons: CONS,
      experienceDate: new Date().toISOString().slice(0, 10),
      experienceType: "alquiler",
      firstHandAttested: true,
      noIncentiveAttested: true,
      noConflictAttested: true,
      termsAccepted: true,
      termsVersion: REVIEW_TERMS_VERSION,
      ...overrides,
    };
  }

  it("rejects unverified users", async () => {
    const user = await store.createUser({ phone: "+34600999888" });
    await expect(service.create(user, payload())).rejects.toThrow(ReviewError);
  });

  it("creates review for email-verified user", async () => {
    const user = await store.createUser({ email: "ana@gmail.com" });
    user.emailVerified = true;
    await store.updateUser(user);

    const review = await service.create(user, payload());

    expect(review.agencyId).toBe(agencyId);
    expect(review.pros).toBe(PROS);
    expect(review.cons).toBe(CONS);
    expect(review.anonymous).toBe(true);
    expect(review.body).toContain("Ventajas:");
  });

  it("creates review for verified user", async () => {
    const user = await verifiedUser();
    const review = await service.create(user, payload());

    expect(review.agencyId).toBe(agencyId);
    expect(review.moderated).toBe(false);
    expect(review.incidentTags).toEqual([]);
  });

  it("stores public name when not anonymous", async () => {
    const user = await verifiedUser();
    const review = await service.create(
      user,
      payload({ anonymous: false, publicName: "Marta G." }),
    );
    expect(review.anonymous).toBe(false);
    expect(review.publicName).toBe("Marta G.");
  });

  it("stores incident tags", async () => {
    const user = await verifiedUser();
    const review = await service.create(
      user,
      payload({
        rating: 2,
        title: "Fianza y reparaciones",
        incidentTags: ["fianza", "reparaciones"],
      }),
    );

    expect(review.incidentTags).toEqual(["fianza", "reparaciones"]);
  });

  it("enforces 7-day rate limit per agency", async () => {
    const user = await verifiedUser();
    await service.create(user, payload({ title: "Primera reseña" }));

    await expect(
      service.create(
        user,
        payload({ role: "propietario", rating: 3, title: "Segunda reseña" }),
      ),
    ).rejects.toThrow(/Rate limit/);
  });

  it("rejects invalid rating", async () => {
    const user = await verifiedUser();
    await expect(
      service.create(user, payload({ rating: 0, title: "Mala" })),
    ).rejects.toThrow();
  });

  it("rejects an experience older than 30 days", async () => {
    const user = await verifiedUser();
    const oldDate = new Date();
    oldDate.setUTCDate(oldDate.getUTCDate() - 31);
    await expect(
      service.create(
        user,
        payload({ experienceDate: oldDate.toISOString().slice(0, 10) }),
      ),
    ).rejects.toThrow(/últimos 30 días/);
  });

  it("marks a published review as helpful once", async () => {
    const author = await verifiedUser("+34600111222");
    const voter = await verifiedUser("+34600999000");
    const review = await service.create(author, payload());
    review.moderated = true;
    await store.updateReview(review);

    const first = await service.markHelpful(voter, review.id);
    const second = await service.markHelpful(voter, review.id);
    expect(first.added).toBe(true);
    expect(first.helpfulCount).toBe(1);
    expect(second.added).toBe(false);
    expect(second.helpfulCount).toBe(1);
  });

  it("rejects helpful votes on own review", async () => {
    const user = await verifiedUser();
    const review = await service.create(user, payload());
    review.moderated = true;
    await store.updateReview(review);
    await expect(service.markHelpful(user, review.id)).rejects.toThrow(
      /propia reseña/,
    );
  });

  it("lets the author edit a review, marks it edited and unpublishes it", async () => {
    const user = await verifiedUser();
    const review = await service.create(user, payload());
    review.moderated = true;
    review.verificationLevel = "acreditada";
    await store.updateReview(review);

    const updated = await service.update(user, review.id, {
      rating: 3,
      title: "Cambié de opinión",
      pros: "Siguieron contestando con claridad en el contrato.",
      cons: "Los plazos de las llaves se alargaron más de lo dicho.",
      anonymous: true,
      incidentTags: ["fianza"],
    });

    expect(updated.title).toBe("Cambié de opinión");
    expect(updated.editedAt).toBeInstanceOf(Date);
    expect(updated.moderated).toBe(false);
    expect(updated.flagged).toBe(false);
    expect(updated.verificationLevel).toBe("declarada");
    expect(updated.incidentTags).toEqual(["fianza"]);
  });

  it("rejects edits from another account", async () => {
    const author = await verifiedUser("+34600111222");
    const other = await verifiedUser("+34600999000");
    const review = await service.create(author, payload());

    await expect(
      service.update(other, review.id, {
        rating: 1,
        title: "No es mía",
        pros: "La visita fue correcta y el piso estaba limpio.",
        cons: "No debería poder cambiar el texto de otra persona.",
      }),
    ).rejects.toThrow(/Solo puedes cambiar/);
  });

  it("soft-deletes a review and allows a new one after deletion", async () => {
    const user = await verifiedUser();
    const review = await service.create(user, payload({ title: "Primera" }));
    review.moderated = true;
    await store.updateReview(review);

    await service.remove(user, review.id);
    const stored = await store.findReviewById(review.id);
    expect(stored?.deletedAt).toBeInstanceOf(Date);
    expect(stored?.flagged).toBe(true);

    const next = await service.create(user, payload({ title: "Segunda" }));
    expect(next.id).not.toBe(review.id);
    expect(next.title).toBe("Segunda");
  });

  it("rejects helpful votes on deleted reviews", async () => {
    const author = await verifiedUser("+34600111222");
    const voter = await verifiedUser("+34600999000");
    const review = await service.create(author, payload());
    review.moderated = true;
    await store.updateReview(review);
    await service.remove(author, review.id);

    await expect(service.markHelpful(voter, review.id)).rejects.toThrow(
      /Reseña no encontrada/,
    );
  });

  it("hides edited and deleted reviews from the public ficha", async () => {
    const user = await verifiedUser();
    const review = await service.create(user, payload());
    review.moderated = true;
    await store.updateReview(review);
    const agencies = new AgencyService(store);
    const slug = (await store.listAgencies())[0]!.slug;

    expect(
      (await agencies.getBySlug(slug, { publicOnly: true }))?.reviews.some(
        (item) => item.id === review.id,
      ),
    ).toBe(true);

    await service.update(user, review.id, {
      rating: 4,
      title: "Ajuste de matices",
      pros: "La gestión siguió siendo clara en el contrato.",
      cons: "Hubo un retraso puntual con las llaves.",
    });
    expect(
      (await agencies.getBySlug(slug, { publicOnly: true }))?.reviews.some(
        (item) => item.id === review.id,
      ),
    ).toBe(false);

    await service.remove(user, review.id);
    expect(
      (await agencies.getBySlug(slug, { publicOnly: true }))?.reviews.some(
        (item) => item.id === review.id,
      ),
    ).toBe(false);
  });
});
