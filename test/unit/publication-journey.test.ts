import { beforeEach, describe, expect, it } from "vitest";

import { REVIEW_TERMS_VERSION } from "@/lib/domain/review-authenticity";
import { experienceCityLabel } from "@/lib/domain/review-city";
import { activeReviewForAgency } from "@/lib/domain/review-limits";
import {
  classifyReview,
  composeRelatoBody,
  composeReviewBody,
} from "@/lib/domain/review-copy";
import { publicAgencyDetail, publicReview } from "@/lib/domain/public-agency";
import type { Agency, Review } from "@/lib/domain/types";
import { MemoryStore } from "@/lib/repositories/memory-store";
import { AccountService } from "@/lib/services/account-service";
import { AgencyService } from "@/lib/services/agency-service";
import { ReviewError, ReviewService } from "@/lib/services/review-service";

const NARRATIVE = "Tardaron tres semanas en devolver la fianza del piso.";
const PROS = "La gestión fue rápida y clara en todo momento.";
const CONS = "Algún retraso menor contestando correos por la tarde.";

describe("publication journey on an isolated memory archive", () => {
  let store: MemoryStore;
  let agencies: AgencyService;
  let reviews: ReviewService;
  let account: AccountService;

  beforeEach(() => {
    store = new MemoryStore();
    agencies = new AgencyService(store);
    reviews = new ReviewService(store);
    account = new AccountService(store);
  });

  function payload(agencyId: string, overrides: Record<string, unknown> = {}) {
    return {
      agencyId,
      role: "inquilino",
      rating: 4,
      narrative: NARRATIVE,
      experienceDate: "2026-10-01",
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

  it("offers the first experience on a ficha that has no reviews", async () => {
    const base = (await store.listAgencies())[0]!;
    const empty: Agency = {
      ...base,
      id: crypto.randomUUID(),
      slug: "inmobiliaria-vacia-aislada",
      name: "Inmobiliaria Vacía",
      city: "Zaragoza",
      address: "Calle Inventada 1",
      postalCode: "50001",
      provisional: true,
    };
    await store.createAgency(empty);

    const ficha = await agencies.getBySlug(empty.slug, { publicOnly: true });
    expect(ficha?.reviews).toEqual([]);
    expect(publicAgencyDetail(ficha!).reviews).toEqual([]);
  });

  it("selects the existing ficha from a commercial alias", async () => {
    const report = await agencies.matchByName("Sol Gestión");
    expect(report.identified.map((hit) => hit.slug)).toEqual([
      "inmobiliaria-sol-madrid",
    ]);
    expect(report.identified[0]?.band).toBe("exact");
    expect(report.identified[0]?.name).not.toBe("Sol Gestión");
  });

  it("publishes immediately with or without a file and blocks a second active review", async () => {
    const user = await store.createUser({ email: "ana.viaje@example.com" });
    user.emailVerified = true;
    await store.updateUser(user);
    const sol = (await store.listAgencies()).find(
      (agency) => agency.slug === "inmobiliaria-sol-madrid",
    )!;
    const other = (await store.listAgencies()).find(
      (agency) => agency.slug !== sol.slug,
    )!;

    const withFile = await reviews.create(user, payload(sol.id), {
      evidencePath: "private/evidence/secret.pdf",
    });
    expect(withFile.moderated).toBe(true);
    expect(withFile.evidencePath).toBe("private/evidence/secret.pdf");
    expect(withFile.body).toBe(composeRelatoBody(NARRATIVE));

    const withoutFile = await reviews.create(user, payload(other.id));
    expect(withoutFile.evidencePath).toBeUndefined();
    expect(withoutFile.moderated).toBe(true);

    const ficha = await agencies.getBySlug(sol.slug, { publicOnly: true });
    expect(ficha?.reviews.some((review) => review.id === withFile.id)).toBe(true);
    const published = publicAgencyDetail(ficha!);
    const visible = published.reviews.find((review) => review.id === withFile.id);
    expect(visible?.narrative).toBe(NARRATIVE);
    expect(visible).not.toHaveProperty("body");
    expect(JSON.stringify(published)).not.toContain("fachada-relato");
    expect(JSON.stringify(published)).not.toContain("secret.pdf");
    expect(JSON.stringify(published)).not.toContain(user.id);

    const dashboard = await account.dashboard(user);
    expect(activeReviewForAgency(dashboard.reviews, sol.slug)?.id).toBe(withFile.id);
    await expect(reviews.create(user, payload(sol.id))).rejects.toThrow(ReviewError);
    await expect(reviews.create(user, payload(sol.id))).rejects.toThrow(
      /una reseña por inmobiliaria/,
    );
  });

  it("keeps a held review off the ficha and visible from the account", async () => {
    const user = await store.createUser({ phone: "+34600999001" });
    user.phoneVerified = true;
    await store.updateUser(user);
    const sol = (await store.listAgencies()).find(
      (agency) => agency.slug === "inmobiliaria-sol-madrid",
    )!;
    const held = await reviews.create(user, payload(sol.id));
    expect(held.moderated).toBe(false);

    const ficha = await agencies.getBySlug(sol.slug, { publicOnly: true });
    expect(ficha?.reviews.some((review) => review.id === held.id)).toBe(false);
    const dashboard = await account.dashboard(user);
    const own = dashboard.reviews.find((review) => review.id === held.id);
    expect(own?.moderated).toBe(false);
    expect(own?.agency?.slug).toBe(sol.slug);
  });

  it("shows and edits an old structured review without turning it into a relato", async () => {
    const user = await store.createUser({ email: "luis.viejo@example.com" });
    user.emailVerified = true;
    await store.updateUser(user);
    const sol = (await store.listAgencies()).find(
      (agency) => agency.slug === "inmobiliaria-sol-madrid",
    )!;
    const [sample] = await store.listAllReviews();
    const old: Review = {
      ...sample!,
      id: crypto.randomUUID(),
      userId: user.id,
      agencyId: sol.id,
      title: "Contrato de 2024",
      pros: PROS,
      cons: CONS,
      body: composeReviewBody(PROS, CONS),
      moderated: true,
      flagged: false,
      deletedAt: undefined,
      experienceCity: "Madrid",
    };
    await store.createReview(old);

    const ficha = await agencies.getBySlug(sol.slug, { publicOnly: true });
    const stored = ficha?.reviews.find((review) => review.id === old.id);
    expect(classifyReview(stored!)).toBe("structured");
    const visible = publicReview(stored!);
    expect(visible.title).toBe("Contrato de 2024");
    expect(visible.pros).toBe(PROS);
    expect(visible.narrative).toBeUndefined();
    expect(visible).not.toHaveProperty("body");

    const edited = await reviews.update(user, old.id, {
      title: "Contrato revisado",
      pros: "Siguieron contestando con claridad en el contrato.",
      cons: "Los plazos de las llaves se alargaron más de lo dicho.",
      rating: 3,
      anonymous: true,
    });
    expect(classifyReview(edited)).toBe("structured");
    expect(edited.body.startsWith("Ventajas:")).toBe(true);
    expect(edited.body).not.toContain("fachada-relato");
  });

  it("keeps a cityless experience out of every municipality", async () => {
    const sol = (await store.listAgencies()).find(
      (agency) => agency.slug === "inmobiliaria-sol-madrid",
    )!;
    const [sample] = await store.listAllReviews();
    const cityless: Review = {
      ...sample!,
      id: crypto.randomUUID(),
      agencyId: sol.id,
      moderated: true,
      flagged: false,
      deletedAt: undefined,
      experienceCity: undefined,
      title: "Sin ciudad",
      body: "La experiencia no dice en qué ciudad fue el piso.",
      pros: undefined,
      cons: undefined,
    };
    await store.createReview(cityless);

    const totals = await agencies.archiveTotals({ publicOnly: true });
    const cities = await agencies.exploreCities({ publicOnly: true });
    const named = cities.reduce((sum, city) => sum + city.reviewCount, 0);
    expect(totals.experiences).toBeGreaterThan(named);
    expect(cities.find((city) => city.slug === "madrid")?.reviewCount).toBe(0);
    expect(cities.find((city) => city.slug === "sevilla")).toBeUndefined();

    const ficha = await agencies.getBySlug(sol.slug, { publicOnly: true });
    const visible = publicReview(
      ficha!.reviews.find((review) => review.id === cityless.id)!,
    );
    expect(visible.experienceCity).toBeUndefined();
    expect(experienceCityLabel(visible.experienceCity)).toBe("Ciudad no indicada");
    expect(visible.experienceCity).not.toBe(sol.city);
  });
});
