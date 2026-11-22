import { beforeEach, describe, expect, it } from "vitest";

import { composeReviewBody, reviewPublicCopy } from "@/lib/domain/review-copy";
import { MemoryStore } from "@/lib/repositories/memory-store";
import { AccountService } from "@/lib/services/account-service";
import { AgencyService } from "@/lib/services/agency-service";
import { AuthService } from "@/lib/services/auth-service";
import { ReviewError, ReviewService } from "@/lib/services/review-service";
import { MockSmsProvider } from "@/lib/services/sms-provider";
import { REVIEW_TERMS_VERSION } from "@/lib/domain/review-authenticity";

const PROS = "La gestión fue rápida y clara en todo momento.";
const CONS = "Algún retraso menor contestando correos por la tarde.";
const NARRATIVE = "Tardaron tres semanas en devolver la fianza del piso.";

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
      narrative: NARRATIVE,
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
    expect(review.body).toContain(NARRATIVE);
    expect(review.title).toBe(NARRATIVE);
    expect(review.moderated).toBe(true);
    expect(review.verificationLevel).toBe("declarada");
  });

  it("creates review for verified user", async () => {
    const user = await verifiedUser();
    const review = await service.create(user, payload());

    expect(review.agencyId).toBe(agencyId);
    expect(review.moderated).toBe(false);
    expect(review.incidentTags).toEqual([]);
    expect(review.origen).toBeUndefined();
  });

  it("stores the calculator origin and keeps it on edit", async () => {
    const user = await verifiedUser();
    const review = await service.create(
      user,
      payload({ origen: "desistimiento" }),
    );
    expect(review.origen).toBe("desistimiento");

    const other = await verifiedUser("+34600111333");
    const ignored = await service.create(other, payload({ origen: "google" }));
    expect(ignored.origen).toBeUndefined();

    const updated = await service.update(user, review.id, {
      narrative: NARRATIVE,
      rating: 3,
      title: "Cambié de opinión",
      pros: "Siguieron contestando con claridad en el contrato.",
      cons: "Los plazos de las llaves se alargaron más de lo dicho.",
      anonymous: true,
      incidentTags: ["fianza"],
    });
    expect(updated.origen).toBe("desistimiento");
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

  it("rejects a decimal rating", async () => {
    const user = await verifiedUser();
    await expect(service.create(user, payload({ rating: 4.8 }))).rejects.toThrow(
      /No se ha publicado la reseña porque la nota no es un número entero/,
    );
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

  it("allows one live review per agency and three per day", async () => {
    const user = await verifiedUser();
    await service.create(user, payload({ title: "Primera reseña" }));

    await expect(
      service.create(
        user,
        payload({ role: "propietario", rating: 3, title: "Segunda reseña" }),
      ),
    ).rejects.toThrow(/una reseña por inmobiliaria/);
  });

  it("does not publish a crime accusation or a phone-only account", async () => {
    const emailUser = await store.createUser({ email: "ana@gmail.com" });
    emailUser.emailVerified = true;
    await store.updateUser(emailUser);
    const held = await service.create(
      emailUser,
      payload({
        title: "Fianza",
        cons: "Son unos estafadores y no devolvieron la fianza.",
      }),
    );
    expect(held.moderated).toBe(false);
    expect(held.prefilterCodes).toContain("crime_accusation");
    expect(held.prefilterReasons?.join(" ")).toMatch(/estafadores/);

    const phoneUser = await verifiedUser("+34600111000");
    const queued = await service.create(
      phoneUser,
      payload({ title: "Otra visita", cons: "Tardaron una semana en entregar las llaves." }),
    );
    expect(queued.moderated).toBe(false);
  });

  it("rejects contact data before saving", async () => {
    const user = await store.createUser({ email: "ana@gmail.com" });
    user.emailVerified = true;
    await store.updateUser(user);
    await expect(
      service.create(user, payload({ cons: "Escribidme a ana@gmail.com hoy mismo." })),
    ).rejects.toThrow(/correo electrónico/);
    expect(await store.listReviewsByUser(user.id)).toHaveLength(0);
  });

  it("keeps new reviews unpublished in pre-moderation mode", async () => {
    await store.setPublicationPolicy({
      id: "policy-1",
      mode: "premoderation",
      previousMode: "immediate",
      changedBy: "Ana Admin",
      changedAt: new Date(),
    });
    const user = await store.createUser({ email: "ana@gmail.com" });
    user.emailVerified = true;
    await store.updateUser(user);
    const review = await service.create(user, payload());
    expect(review.moderated).toBe(false);
    expect((await store.getPublicationPolicy()).updatedBy).toBe("Ana Admin");
  });

  it("rejects invalid rating", async () => {
    const user = await verifiedUser();
    await expect(
      service.create(user, payload({ rating: 0, title: "Mala" })),
    ).rejects.toThrow();
  });

  it("accepts an experience older than 30 days and within 36 months", async () => {
    const user = await verifiedUser();
    const date = new Date();
    date.setUTCDate(date.getUTCDate() - 400);
    const iso = date.toISOString().slice(0, 10);
    const review = await service.create(user, payload({ experienceDate: iso }));
    expect(review.experienceDate.toISOString().slice(0, 10)).toBe(iso);
  });

  it("rejects an experience older than 36 months", async () => {
    const user = await verifiedUser();
    const oldDate = new Date();
    oldDate.setUTCDate(oldDate.getUTCDate() - 1200);
    await expect(
      service.create(
        user,
        payload({ experienceDate: oldDate.toISOString().slice(0, 10) }),
      ),
    ).rejects.toThrow(/últimos 36 meses/);
  });

  it("rejects a future experience date", async () => {
    const user = await verifiedUser();
    const future = new Date();
    future.setUTCDate(future.getUTCDate() + 1);
    await expect(
      service.create(
        user,
        payload({ experienceDate: future.toISOString().slice(0, 10) }),
      ),
    ).rejects.toThrow(/no puede ser futura/);
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

    const edited = "Cambié de opinión: la fianza llegó, pero tarde.";
    const updated = await service.update(user, review.id, {
      narrative: edited,
      rating: 3,
      pros: "Siguieron contestando con claridad en el contrato.",
      cons: "Los plazos de las llaves se alargaron más de lo dicho.",
      anonymous: true,
      incidentTags: ["fianza"],
    });

    expect(updated.title).toBe(edited);
    expect(reviewPublicCopy(updated).narrative).toBe(edited);
    expect(reviewPublicCopy(updated).title).toBeUndefined();
    expect(updated.editedAt).toBeInstanceOf(Date);
    expect(updated.moderated).toBe(false);
    expect(updated.flagged).toBe(false);
    expect(updated.verificationLevel).toBe("declarada");
    expect(updated.incidentTags).toEqual(["fianza"]);
  });

  it("does not republish a review a moderator already restricted", async () => {
    const user = await store.createUser({ email: "ana@gmail.com" });
    user.emailVerified = true;
    await store.updateUser(user);
    const review = await service.create(user, payload());
    review.flagged = true;
    review.moderationReason = "Restringida por un moderador tras revisarla.";
    review.moderatedAt = new Date();
    await store.updateReview(review);

    const updated = await service.update(user, review.id, {
      narrative: NARRATIVE,
      rating: 4,
      title: "Texto corregido",
      pros: PROS,
      cons: CONS,
    });
    expect(updated.moderated).toBe(false);
    expect(updated.flagged).toBe(true);
  });

  it("does not republish after a negative moderation decision", async () => {
    const user = await store.createUser({ email: "ana@gmail.com" });
    user.emailVerified = true;
    await store.updateUser(user);
    const review = await service.create(user, payload());
    review.moderated = false;
    review.flagged = false;
    review.moderatedAt = new Date();
    review.moderationReason = "No se publica: falta una experiencia identificable.";
    await store.updateReview(review);

    const updated = await service.update(user, review.id, {
      narrative: NARRATIVE,
      rating: 4,
      title: "Sigo contando lo mismo",
      pros: PROS,
      cons: CONS,
    });
    expect(updated.moderated).toBe(false);
  });

  it("lets an open notice hold only the reported review", async () => {
    const user = await store.createUser({ email: "ana@gmail.com" });
    user.emailVerified = true;
    await store.updateUser(user);
    const agencies = await store.listAgencies();
    const reported = await service.create(user, payload({ agencyId: agencies[0]!.id }));
    const other = await service.create(
      user,
      payload({
        agencyId: agencies[1]!.id,
        title: "Otra ficha",
      }),
    );
    expect(other.moderated).toBe(true);
    await store.createContentNotice({
      id: "notice-open",
      reviewId: reported.id,
      reporterName: "Alguien",
      reporterEmail: "aviso@example.com",
      category: "false_statement",
      exactExcerpt: "Algún retraso menor",
      legalReason: "El plazo que se afirma no coincide con el expediente interno.",
      goodFaithAttested: true,
      status: "pendiente",
      createdAt: new Date(),
      acknowledgedAt: new Date(),
    });

    const editedOther = await service.update(user, other.id, {
      narrative: NARRATIVE,
      rating: 4,
      title: "Sigue en la otra ficha",
      pros: PROS,
      cons: CONS,
    });
    expect(editedOther.moderated).toBe(true);

    const editedReported = await service.update(user, reported.id, {
      narrative: NARRATIVE,
      rating: 4,
      title: "Texto nuevo de la denunciada",
      pros: PROS,
      cons: CONS,
    });
    expect(editedReported.moderated).toBe(false);
  });

  it("rejects edits from another account", async () => {
    const author = await verifiedUser("+34600111222");
    const other = await verifiedUser("+34600999000");
    const review = await service.create(author, payload());

    await expect(
      service.update(other, review.id, {
      narrative: NARRATIVE,
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

    const second = "Segunda experiencia, ya con la fianza devuelta.";
    const next = await service.create(user, payload({ narrative: second }));
    expect(next.id).not.toBe(review.id);
    expect(next.title).toBe(second);
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
      narrative: NARRATIVE,
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

  it("publishes a clean email review on the ficha and keeps a phone review in the account", async () => {
    const emailUser = await store.createUser({ email: "ana@gmail.com" });
    emailUser.emailVerified = true;
    await store.updateUser(emailUser);
    const published = await service.create(emailUser, payload());
    const agencies = new AgencyService(store);
    const slug = (await store.listAgencies())[0]!.slug;
    const ficha = await agencies.getBySlug(slug, { publicOnly: true });
    expect(ficha?.reviews.some((item) => item.id === published.id)).toBe(true);
    const copy = reviewPublicCopy(published);
    expect(copy.narrative).toBe(NARRATIVE);
    expect(copy.title).toBeUndefined();

    const phoneUser = await verifiedUser("+34600888777");
    const pending = await service.create(phoneUser, payload());
    expect(pending.moderated).toBe(false);
    const after = await agencies.getBySlug(slug, { publicOnly: true });
    expect(after?.reviews.some((item) => item.id === pending.id)).toBe(false);
    const account = await new AccountService(store).dashboard(phoneUser!);
    expect(account.reviews.map((item) => item.id)).toContain(pending.id);
    expect(account.reviews.find((item) => item.id === pending.id)?.moderated).toBe(
      false,
    );
  });

  it("rejects a narrative that is only a fragment", async () => {
    const user = await verifiedUser("+34600888666");
    await expect(
      service.create(user, payload({ narrative: "Muy corta" })),
    ).rejects.toThrow(/40 caracteres/);
  });

  it("keeps the title when a structured review is edited", async () => {
    const user = await verifiedUser("+34600888555");
    const review = await service.create(user, payload());
    review.title = "La fianza volvió tarde";
    review.pros = PROS;
    review.cons = CONS;
    review.body = composeReviewBody(PROS, CONS);
    await store.updateReview(review);

    const updated = await service.update(user, review.id, {
      rating: 2,
      title: "La fianza volvió tarde",
      pros: PROS,
      cons: CONS,
    });
    expect(updated.body).toBe(composeReviewBody(PROS, CONS));
    expect(reviewPublicCopy(updated)).toMatchObject({
      format: "structured",
      title: "La fianza volvió tarde",
      pros: PROS,
      cons: CONS,
    });
  });

  it("keeps the title and the prose of a review that is not a relato", async () => {
    const user = await verifiedUser("+34600888444");
    const review = await service.create(user, payload());
    const prose = "El piso no coincidía con el anuncio y tardaron en decirlo.";
    review.title = "Visita en Chamberí";
    review.pros = undefined;
    review.cons = undefined;
    review.body = prose;
    await store.updateReview(review);

    const updated = await service.update(user, review.id, {
      rating: 3,
      title: "Visita en Chamberí",
      body: prose,
    });
    expect(reviewPublicCopy(updated)).toMatchObject({
      format: "prose",
      title: "Visita en Chamberí",
      prose,
    });
  });
});
