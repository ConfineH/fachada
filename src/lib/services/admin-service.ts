import { randomUUID } from "node:crypto";

import { buildAgencySlug } from "@/lib/domain/agency-slug";
import type { Agency, AgencyLocation, AgencySubmission, AgencyTip, Claim, ContentNotice, Review } from "@/lib/domain/types";
import {
  adminAddAliasSchema,
  adminCreateAgencySchema,
  adminCreateLocationSchema,
} from "@/lib/domain/validation";
import type { AgencySubmissionService } from "@/lib/services/agency-submission-service";
import type { ClaimService } from "@/lib/services/claim-service";
import type { Repository } from "@/lib/repositories/types";
import { AgencyService } from "@/lib/services/agency-service";
import type { ContentNoticeService } from "@/lib/services/content-notice-service";
import type { EmailProvider } from "@/lib/services/email-provider";

export class AdminError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AdminError";
  }
}

export type ClaimWithAgency = Claim & { agencyName: string };
export type ReviewWithAgency = Review & {
  agencyName: string;
  evidenceUrl?: string;
};

export type SubmissionWithMeta = AgencySubmission;
export type LocationWithAgency = AgencyLocation & {
  agencyName: string;
  agencySlug: string;
};

export type TipWithAgency = AgencyTip & {
  agencyName: string;
  agencySlug: string;
};

export class AdminService {
  constructor(
    private readonly repo: Repository,
    private readonly claimService: ClaimService,
    private readonly agencySubmissionService: AgencySubmissionService,
    private readonly contentNoticeService?: ContentNoticeService,
    private readonly email?: EmailProvider,
  ) {}

  async listPendingContentNotices(): Promise<ContentNotice[]> {
    const notices = await this.repo.listContentNotices();
    return notices.filter(
      (notice) =>
        notice.status === "pendiente" ||
        notice.status === "informacion_requerida" ||
        Boolean(notice.appealedAt && !notice.appealDecidedAt),
    );
  }

  async decideContentNotice(id: string, input: unknown) {
    if (!this.contentNoticeService) {
      throw new AdminError("Content notice service unavailable");
    }
    return this.contentNoticeService.decide(id, input);
  }

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

  async moderateReview(
    reviewId: string,
    reason: string,
    moderated = true,
    accreditExperience = false,
  ) {
    const review = await this.repo.findReviewById(reviewId);
    if (!review) throw new AdminError("Review not found");
    if (reason.trim().length < 10) {
      throw new AdminError("Motiva la decisión con al menos 10 caracteres");
    }

    review.moderated = moderated;
    if (moderated) review.flagged = false;
    review.moderationReason = reason.trim();
    review.moderatedAt = new Date();
    review.verificationLevel =
      accreditExperience && review.evidencePath ? "acreditada" : "declarada";
    await this.repo.updateReview(review);
    const author = await this.repo.findUserById(review.userId);
    if (author?.email && this.email) {
      await Promise.allSettled([
        this.email.sendMessage(
          author.email,
          "Decisión sobre tu reseña en Fachada",
          `Resultado: publicada\n\nMotivo: ${review.moderationReason}`,
        ),
      ]);
    }
    return review;
  }

  async flagReview(reviewId: string, reason: string, flagged = true) {
    const review = await this.repo.findReviewById(reviewId);
    if (!review) throw new AdminError("Review not found");
    if (reason.trim().length < 10) {
      throw new AdminError("Motiva la decisión con al menos 10 caracteres");
    }

    review.flagged = flagged;
    review.moderationReason = reason.trim();
    review.moderatedAt = new Date();
    await this.repo.updateReview(review);
    const author = await this.repo.findUserById(review.userId);
    if (author?.email && this.email) {
      await Promise.allSettled([
        this.email.sendMessage(
          author.email,
          "Decisión sobre tu reseña en Fachada",
          `Resultado: restringida\n\nMotivo: ${review.moderationReason}`,
        ),
      ]);
    }
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

  async listPendingTips(): Promise<TipWithAgency[]> {
    const pending = await this.repo.listPendingTips();
    return Promise.all(
      pending.map(async (tip) => {
        const agency = await this.repo.findAgencyById(tip.agencyId);
        return {
          ...tip,
          agencyName: agency?.name ?? "Desconocida",
          agencySlug: agency?.slug ?? "",
        };
      }),
    );
  }

  async approveTip(id: string) {
    const tip = await this.repo.findTipById(id);
    if (!tip) throw new AdminError("Tip not found");
    if (tip.status !== "pendiente") {
      throw new AdminError("Este aporte ya está resuelto");
    }
    await new AgencyService(this.repo).applyTip(tip);
    tip.status = "aprobado";
    tip.resolvedAt = new Date();
    await this.repo.updateTip(tip);
    return tip;
  }

  async rejectTip(id: string) {
    const tip = await this.repo.findTipById(id);
    if (!tip) throw new AdminError("Tip not found");
    tip.status = "rechazado";
    tip.resolvedAt = new Date();
    await this.repo.updateTip(tip);
    return tip;
  }
}
