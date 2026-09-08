import { beforeEach, describe, expect, it } from "vitest";

import { MemoryStore } from "@/lib/repositories/memory-store";
import { AuthService } from "@/lib/services/auth-service";
import { ReviewError, ReviewService } from "@/lib/services/review-service";
import { MockSmsProvider } from "@/lib/services/sms-provider";

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
});
