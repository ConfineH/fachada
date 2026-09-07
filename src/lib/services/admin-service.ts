import type { AgencySubmission, Claim, Review } from "@/lib/domain/types";
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
}
