import { beforeEach, describe, expect, it } from "vitest";

import { REVIEW_TERMS_VERSION } from "@/lib/domain/review-authenticity";
import { isPublicReview } from "@/lib/domain/review-visibility";
import { MemoryStore } from "@/lib/repositories/memory-store";
import { AdminService } from "@/lib/services/admin-service";
import { AgencySubmissionService } from "@/lib/services/agency-submission-service";
import { ClaimService } from "@/lib/services/claim-service";
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
      experienceCity: "Madrid",
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
    expect((await store.findReviewById(reviewId))?.flagged).toBe(false);
  });

  it("hides personal data and crime accusations until a person reviews them", async () => {
    const personal = await service.create({
      reviewId,
      reporterName: "Agencia Ejemplo",
      reporterEmail: "legal@agencia.example",
      category: "personal_data",
      exactExcerpt: "La comunicación posterior fue lenta",
      legalReason:
        "El fragmento identifica a una persona física con datos innecesarios.",
      goodFaithAttested: true,
    }, { reporterVerified: true });
    const hidden = await store.findReviewById(reviewId);
    expect(hidden?.flagged).toBe(true);
    expect(hidden?.moderationReason).toMatch(/Oculta de forma provisional/);
    expect(isPublicReview(hidden!)).toBe(false);

    await service.decide(personal.id, {
      status: "mantenido",
      decisionRule: "Normas: datos personales",
      decisionReason:
        "El fragmento no identifica a una persona más allá del seudónimo.",
    });
    const restored = await store.findReviewById(reviewId);
    expect(restored?.flagged).toBe(false);
    expect(isPublicReview(restored!)).toBe(true);
  });

  it("leaves a false-statement notice visible while it is reviewed", async () => {
    await service.create({
      reviewId,
      reporterName: "Agencia Ejemplo",
      reporterEmail: "legal@agencia.example",
      category: "false_statement",
      exactExcerpt: "La comunicación posterior fue lenta",
      legalReason:
        "El plazo de respuesta que se afirma no coincide con el expediente.",
      goodFaithAttested: true,
    });
    const review = await store.findReviewById(reviewId);
    expect(review?.flagged).toBe(false);
    expect(isPublicReview(review!)).toBe(true);
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

  it("keeps an unverified notice in the queue without hiding the review", async () => {
    await service.create({
      reviewId,
      reporterName: "Anónimo",
      reporterEmail: "inventado@example.com",
      category: "personal_data",
      exactExcerpt: "La comunicación posterior fue lenta",
      legalReason:
        "El fragmento identifica a una persona física con datos innecesarios.",
      goodFaithAttested: true,
    });
    const review = await store.findReviewById(reviewId);
    expect(review?.flagged).toBe(false);
    expect(isPublicReview(review!)).toBe(true);
    expect((await store.listContentNotices())[0]?.status).toBe("pendiente");
  });

  it("does not hide the same reason twice before a person reviews it", async () => {
    const payload = {
      reviewId,
      reporterName: "Agencia Ejemplo",
      category: "personal_data" as const,
      exactExcerpt: "La comunicación posterior fue lenta",
      legalReason:
        "El fragmento identifica a una persona física con datos innecesarios.",
      goodFaithAttested: true,
    };
    await service.create(
      { ...payload, reporterEmail: "uno@agencia.example" },
      { reporterVerified: true, ip: "203.0.113.4" },
    );
    await service.create(
      { ...payload, reporterEmail: "dos@agencia.example" },
      { reporterVerified: true, ip: "203.0.113.5" },
    );
    const review = await store.findReviewById(reviewId);
    expect(review?.flagged).toBe(true);
    expect(review?.moderationReason).toMatch(/Datos personales/);
    expect(await store.listContentNotices()).toHaveLength(2);
  });

  it("does not hide again when the same reason was already kept", async () => {
    const payload = {
      reviewId,
      reporterName: "Agencia Ejemplo",
      category: "personal_data" as const,
      exactExcerpt: "La comunicación posterior fue lenta",
      legalReason:
        "El fragmento identifica a una persona física con datos innecesarios.",
      goodFaithAttested: true,
    };
    const first = await service.create(
      { ...payload, reporterEmail: "uno@agencia.example" },
      { reporterVerified: true },
    );
    await service.decide(first.id, {
      status: "mantenido",
      decisionRule: "Se mantiene la reseña",
      decisionReason: "El fragmento no identifica a una persona física.",
    });
    expect((await store.findReviewById(reviewId))?.flagged).toBe(false);

    const second = await service.create(
      { ...payload, reporterEmail: "dos@agencia.example" },
      { reporterVerified: true, ip: "203.0.113.20" },
    );
    const review = await store.findReviewById(reviewId);
    expect(review?.flagged).toBe(false);
    expect(isPublicReview(review!)).toBe(true);
    expect(second.status).toBe("pendiente");
  });

  it("limits notices to five per email and five per IP each day", async () => {
    const base = {
      reviewId,
      reporterName: "Agencia Ejemplo",
      category: "other" as const,
      exactExcerpt: "La comunicación posterior fue lenta",
      legalReason:
        "El plazo de respuesta que se afirma no coincide con el expediente.",
      goodFaithAttested: true,
      status: "pendiente" as const,
      acknowledgedAt: new Date(),
      createdAt: new Date(),
    };
    for (let index = 0; index < 5; index += 1) {
      await store.createContentNotice({
        ...base,
        id: `notice-email-${index}`,
        reporterEmail: "mismo@agencia.example",
        reporterIp: `198.51.100.${index}`,
      });
    }
    await expect(
      service.create(
        { ...base, reporterEmail: "mismo@agencia.example" },
        { ip: "203.0.113.9" },
      ),
    ).rejects.toThrow(/este correo/);

    for (let index = 0; index < 5; index += 1) {
      await store.createContentNotice({
        ...base,
        id: `notice-ip-${index}`,
        reporterEmail: `otro${index}@agencia.example`,
        reporterIp: "203.0.113.8",
      });
    }
    await expect(
      service.create(
        { ...base, reporterEmail: "nuevo@agencia.example" },
        { ip: "203.0.113.8" },
      ),
    ).rejects.toThrow(/esta conexión/);
  });

  it("closes the pending hide notice when the review queue approves it", async () => {
    const notice = await service.create({
      reviewId,
      reporterName: "Agencia Ejemplo",
      reporterEmail: "legal@agencia.example",
      category: "offensive_or_crime",
      exactExcerpt: "La comunicación posterior fue lenta",
      legalReason:
        "El texto imputa un delito sin hechos comprobables que lo sostengan.",
      goodFaithAttested: true,
    }, { reporterVerified: true });
    const admin = new AdminService(
      store,
      new ClaimService(store),
      new AgencySubmissionService(store),
      service,
    );
    await admin.moderateReview(
      reviewId,
      "Se mantiene: el texto no imputa un delito concreto.",
    );
    expect((await store.findContentNoticeById(notice.id))?.status).toBe(
      "mantenido",
    );
    expect((await store.findReviewById(reviewId))?.flagged).toBe(false);
  });
});
