import { beforeEach, describe, expect, it } from "vitest";

import { MemoryStore } from "@/lib/repositories/memory-store";
import { AuthService } from "@/lib/services/auth-service";
import { ReviewError, ReviewService } from "@/lib/services/review-service";
import { MockSmsProvider } from "@/lib/services/sms-provider";

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

  async function verifiedUser() {
    await auth.requestCode("+34600111222");
    const code = sms.lastCodeFor("+34600111222")!;
    const session = await auth.verifyCode("+34600111222", code);
    return auth.getUserFromSession(session.token);
  }

  it("rejects unverified users", async () => {
    const user = await store.createUser("+34600999888");
    await expect(
      service.create(user, {
        agencyId,
        role: "inquilino",
        rating: 4,
        title: "Buena experiencia",
        body: "La gestión fue rápida y clara en todo momento.",
      }),
    ).rejects.toThrow(ReviewError);
  });

  it("creates review for verified user", async () => {
    const user = await verifiedUser();
    const review = await service.create(user, {
      agencyId,
      role: "inquilino",
      rating: 4,
      title: "Buena experiencia",
      body: "La gestión fue rápida y clara en todo momento.",
    });

    expect(review.agencyId).toBe(agencyId);
    expect(review.moderated).toBe(false);
  });

  it("enforces 7-day rate limit per agency", async () => {
    const user = await verifiedUser();
    await service.create(user, {
      agencyId,
      role: "inquilino",
      rating: 5,
      title: "Primera reseña",
      body: "Todo correcto con la gestión del alquiler.",
    });

    await expect(
      service.create(user, {
        agencyId,
        role: "propietario",
        rating: 3,
        title: "Segunda reseña",
        body: "Intento de segunda reseña en la misma agencia.",
      }),
    ).rejects.toThrow(/Rate limit/);
  });

  it("rejects invalid rating", async () => {
    const user = await verifiedUser();
    await expect(
      service.create(user, {
        agencyId,
        role: "inquilino",
        rating: 0,
        title: "Mala",
        body: "Rating inválido para probar validación.",
      }),
    ).rejects.toThrow();
  });
});
