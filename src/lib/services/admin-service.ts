import { randomUUID } from "node:crypto";

import { buildAgencySlug } from "@/lib/domain/agency-slug";
import type { Agency, AgencyLocation, AgencySubmission, Claim, Review } from "@/lib/domain/types";
import {
  adminAddAliasSchema,
  adminCreateAgencySchema,
  adminCreateLocationSchema,
} from "@/lib/domain/validation";
import type { AgencySubmissionService } from "@/lib/services/agency-submission-service";
import type { Repository } from "@/lib/repositories/types";
import type { ClaimService } from "@/lib/services/claim-service";

export class AdminError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AdminError";
  }
}

export type ClaimWithAgency = Claim & { agencyName: string };
export type ReviewWithAgency = Review & { agencyName: string };

export type SubmissionWithMeta = AgencySubmission;
export type LocationWithAgency = AgencyLocation & {
  agencyName: string;
  agencySlug: string;
};

export class AdminService {
  constructor(
    private readonly repo: Repository,
    private readonly claimService: ClaimService,
    private readonly agencySubmissionService: AgencySubmissionService,
  ) {}

  async listPendingClaims(): Promise<ClaimWithAgency[]> {
    const claims = await this.repo.listClaims();
    const pending = claims.filter((c) => c.status === "pendiente");

    return Promise.all(
      pending.map(async (claim) => {
        const agency = await this.repo.findAgencyById(claim.agencyId);
        return {
          ...claim,
          agencyName: agency?.name ?? "Desconocida",
        };
      }),
    );
  }

  async listReviewsForModeration(): Promise<ReviewWithAgency[]> {
    const reviews = await this.repo.listAllReviews();
    const queue = reviews.filter((r) => !r.moderated || r.flagged);

    return Promise.all(
      queue.map(async (review) => {
        const agency = await this.repo.findAgencyById(review.agencyId);
        return {
          ...review,
          agencyName: agency?.name ?? "Desconocida",
        };
      }),
    );
  }

  async listPendingAgencySubmissions(): Promise<SubmissionWithMeta[]> {
    const all = await this.repo.listAgencySubmissions();
    return all.filter((s) => s.status === "pendiente");
  }

  async approveAgencySubmission(id: string) {
    return this.agencySubmissionService.approve(id);
  }

  async rejectAgencySubmission(id: string) {
    return this.agencySubmissionService.reject(id);
  }

  async approveClaim(claimId: string) {
    return this.claimService.approve(claimId);
  }

  async rejectClaim(claimId: string) {
    return this.claimService.reject(claimId);
  }

  async moderateReview(reviewId: string, moderated = true) {
    const review = await this.repo.findReviewById(reviewId);
    if (!review) throw new AdminError("Review not found");

    review.moderated = moderated;
    if (moderated) review.flagged = false;
    await this.repo.updateReview(review);
    return review;
  }

  async flagReview(reviewId: string, flagged = true) {
    const review = await this.repo.findReviewById(reviewId);
    if (!review) throw new AdminError("Review not found");

    review.flagged = flagged;
    await this.repo.updateReview(review);
    return review;
  }

  async createAgency(input: unknown): Promise<Agency> {
    const data = adminCreateAgencySchema.parse(input);
    const normalizedName = data.name.trim().toLowerCase();
    const normalizedCity = data.city.trim().toLowerCase();

    const agencies = await this.repo.listAgencies();
    const duplicate = agencies.some(
      (a) =>
        a.name.trim().toLowerCase() === normalizedName &&
        a.city.trim().toLowerCase() === normalizedCity,
    );
    if (duplicate) {
      throw new AdminError(
        "Ya existe una inmobiliaria con ese nombre en esa ciudad.",
      );
    }

    const baseSlug = buildAgencySlug(data.name, data.city);
    let slug = baseSlug;
    let i = 2;
    while (await this.repo.findAgencyBySlug(slug)) {
      slug = `${baseSlug}-${i}`;
      i += 1;
    }

    const phonePublished = !data.noPhoneOnline;
    const agency: Agency = {
      id: randomUUID(),
      slug,
      name: data.name.trim(),
      address: data.address.trim(),
      city: data.city.trim(),
      postalCode: data.postalCode.trim(),
      phonePublished,
      phone: phonePublished ? data.phone!.trim() : "",
      email: data.email?.trim() ?? "",
      website: data.website,
      idealistaUrl: data.idealistaUrl,
      claimed: false,
      verified: false,
      premium: false,
      createdAt: new Date(),
    };

    await this.repo.createAgency(agency);

    const seen = new Set<string>();
    for (const raw of data.aliases ?? []) {
      const alias = raw.trim();
      const key = alias.toLowerCase();
      if (!alias || seen.has(key)) continue;
      seen.add(key);
      await this.repo.createAlias({
        id: randomUUID(),
        agencyId: agency.id,
        alias,
        kind: "commercial",
      });
    }

    return agency;
  }

  async addAlias(input: unknown) {
    const data = adminAddAliasSchema.parse(input);
    const agency = data.agencyId
      ? await this.repo.findAgencyById(data.agencyId)
      : await this.repo.findAgencyBySlug(data.slug!);
    if (!agency) throw new AdminError("Agency not found");

    await this.repo.createAlias({
      id: randomUUID(),
      agencyId: agency.id,
      alias: data.alias,
      kind: data.kind,
      note: data.note,
    });

    return { agencyId: agency.id, alias: data.alias, kind: data.kind };
  }

  async createLocation(input: unknown) {
    const data = adminCreateLocationSchema.parse(input);
    const agency = data.agencyId
      ? await this.repo.findAgencyById(data.agencyId)
      : await this.repo.findAgencyBySlug(data.slug!);
    if (!agency) throw new AdminError("Agency not found");

    const location = {
      id: randomUUID(),
      agencyId: agency.id,
      kind: data.kind,
      status: "publicado" as const,
      label: data.label,
      address: data.address,
      city: data.city,
      postalCode: data.postalCode ?? "",
      note: data.note,
      createdAt: new Date(),
    };
    await this.repo.createLocation(location);
    return location;
  }

  async listPendingLocations() {
    const pending = await this.repo.listPendingLocations();
    return Promise.all(
      pending.map(async (location) => {
        const agency = await this.repo.findAgencyById(location.agencyId);
        return {
          ...location,
          agencyName: agency?.name ?? "Desconocida",
          agencySlug: agency?.slug ?? "",
        };
      }),
    );
  }

  async publishLocation(id: string) {
    const location = await this.repo.findLocationById(id);
    if (!location) throw new AdminError("Location not found");
    location.status = "publicado";
    await this.repo.updateLocation(location);
    return location;
  }

  async rejectLocation(id: string) {
    const location = await this.repo.findLocationById(id);
    if (!location) throw new AdminError("Location not found");
    await this.repo.deleteLocation(id);
    return location;
  }
}
