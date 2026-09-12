import { beforeEach, describe, expect, it } from "vitest";

import { REVIEW_TERMS_VERSION } from "@/lib/domain/review-authenticity";
import { MemoryStore } from "@/lib/repositories/memory-store";
import { ContentNoticeService } from "@/lib/services/content-notice-service";
import { MockEmailProvider } from "@/lib/services/email-provider";
import { ReviewService } from "@/lib/services/review-service";

describe("ContentNoticeService", () => {
  let store: MemoryStore;
  let email: MockEmailProvider;
  let service: ContentNoticeService;
  let reviewId: string;

  beforeEach(async () => {
    store = new MemoryStore();
    email = new MockEmailProvider();
    service = new ContentNoticeService(store, email);
    const user = await store.createUser({ email: "autor@example.com" });
    user.emailVerified = true;
    await store.updateUser(user);
    const agency = (await store.listAgencies())[0]!;
    const review = await new ReviewService(store).create(user, {
      agencyId: agency.id,
      role: "inquilino",
      rating: 2,
      title: "Problemas de gestión",
      pros: "La visita inicial fue puntual y correcta.",
      cons: "La comunicación posterior fue lenta durante varios días.",
      experienceDate: new Date().toISOString().slice(0, 10),
      experienceType: "alquiler",
      firstHandAttested: true,
      noIncentiveAttested: true,
      noConflictAttested: true,
      termsAccepted: true,
      termsVersion: REVIEW_TERMS_VERSION,
    });
    review.moderated = true;
    await store.updateReview(review);
    reviewId = review.id;
  });

  it("acknowledges a sufficiently precise notice", async () => {
    const notice = await service.create({
      reviewId,
      reporterName: "Agencia Ejemplo",
      reporterEmail: "legal@agencia.example",
      relationship: "Representante",
      category: "honor",
      exactExcerpt: "La comunicación posterior fue lenta",
      legalReason:
        "Consideramos inexacta esta afirmación y aportamos el contrato de soporte.",
      goodFaithAttested: true,
    });

    expect(notice.status).toBe("pendiente");
    expect(email.messages[0]?.subject).toContain(notice.id);
  });

  it("records a reason, restricts the review and notifies both parties", async () => {
    const notice = await service.create({
      reviewId,
      reporterName: "Agencia Ejemplo",
      reporterEmail: "legal@agencia.example",
      category: "personal_data",
      exactExcerpt: "La comunicación posterior fue lenta",
      legalReason:
        "El fragmento identifica a una persona física con datos innecesarios.",
      goodFaithAttested: true,
    });

    const decided = await service.decide(notice.id, {
      status: "retirado",
      decisionRule: "Normas: datos personales",
      decisionReason:
        "Se restringe preventivamente por identificar a un tercero innecesariamente.",
    });

    expect(decided.decisionReason).toContain("tercero");
    expect((await store.findReviewById(reviewId))?.flagged).toBe(true);
    expect(email.messages).toHaveLength(3);
  });
});
