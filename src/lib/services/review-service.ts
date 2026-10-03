import { randomUUID } from "node:crypto";

import { tagsFromSentiments } from "@/lib/domain/incidents";
import { isAccountVerified } from "@/lib/domain/identity";
import { composeReviewBody } from "@/lib/domain/review-copy";
import { isPublicReview } from "@/lib/domain/review-visibility";
import type { Review, User } from "@/lib/domain/types";
import { reviewEditSchema, reviewInputSchema } from "@/lib/domain/validation";
import { notifyModerationQueue } from "@/lib/ops/moderation-alert";
import type { Repository } from "@/lib/repositories/types";
import type { EmailProvider } from "@/lib/services/email-provider";

const RATE_LIMIT_MS = 7 * 24 * 60 * 60 * 1000;

export class ReviewError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ReviewError";
  }
}

export class ReviewService {
  constructor(
    private readonly repo: Repository,
    private readonly email?: EmailProvider,
  ) {}

  async create(
    user: User | undefined,
    input: unknown,
    options: { evidencePath?: string } = {},
  ): Promise<Review> {
    if (!isAccountVerified(user)) {
      throw new ReviewError("Account verification required");
    }

    const data = reviewInputSchema.parse(input);
    const agency =
      (data.agencyId
        ? await this.repo.findAgencyById(data.agencyId)
        : null) ??
      (data.agencySlug
        ? await this.repo.findAgencyBySlug(data.agencySlug)
        : null);
    if (!agency) {
      throw new ReviewError(
        "Inmobiliaria no encontrada. Recarga la ficha e inténtalo de nuevo.",
      );
    }
    const agencyId = agency.id;

    const userReviews = await this.repo.listReviewsByUser(user.id);
    const recent = userReviews.find(
      (r) =>
        !r.deletedAt &&
        r.agencyId === agencyId &&
        Date.now() - r.createdAt.getTime() < RATE_LIMIT_MS,
    );

    if (recent) {
      throw new ReviewError("Rate limit: one review per agency every 7 days");
    }

    const marked = markedExperience(data);
    const anonymous = data.anonymous ?? true;
    const review: Review = {
      id: randomUUID(),
      userId: user.id,
      agencyId,
      role: data.role,
      rating: data.rating,
      title: data.title,
      pros: data.pros,
      cons: data.cons,
      body: composeReviewBody(data.pros, data.cons),
      anonymous,
      publicName: anonymous ? undefined : data.publicName?.trim(),
      wouldRecommend: data.wouldRecommend,
      helpfulCount: 0,
      incidentTags: marked.incidentTags,
      incidentSentiments: marked.incidentSentiments,
      experienceDate: data.experienceDate,
      experienceType: data.experienceType,
      firstHandAttested: data.firstHandAttested,
      noIncentiveAttested: data.noIncentiveAttested,
      noConflictAttested: data.noConflictAttested,
      verificationLevel: "declarada",
      identityVerification: user.emailVerified ? "email" : "phone",
      evidencePath: options.evidencePath,
      evidenceDeleteAfter: options.evidencePath
        ? new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
        : undefined,
      termsVersion: data.termsVersion,
      termsAcceptedAt: new Date(),
      createdAt: new Date(),
      moderated: false,
      flagged: false,
    };

    await this.repo.createReview(review);
    await notifyModerationQueue(this.email, {
      kind: "Reseña",
      detail: `«${review.title}» sobre ${agency.name} (${agency.city}).`,
    });
    return review;
  }

  async update(
    user: User | undefined,
    reviewId: string,
    input: unknown,
  ): Promise<Review> {
    if (!isAccountVerified(user)) {
      throw new ReviewError("Account verification required");
    }
    const review = await this.ownedReview(user.id, reviewId);
    const data = reviewEditSchema.parse(input);
    const anonymous = data.anonymous ?? true;
    const marked = markedExperience(data);
    const next: Review = {
      ...review,
      rating: data.rating,
      title: data.title,
      pros: data.pros,
      cons: data.cons,
      body: composeReviewBody(data.pros, data.cons),
      anonymous,
      publicName: anonymous ? undefined : data.publicName?.trim(),
      wouldRecommend: data.wouldRecommend ?? undefined,
      incidentTags: marked.incidentTags,
      incidentSentiments: marked.incidentSentiments,
      editedAt: new Date(),
      moderated: false,
      flagged: false,
      verificationLevel: "declarada",
    };
    await this.repo.updateReview(next);
    const editedAgency = await this.repo.findAgencyById(next.agencyId);
    await notifyModerationQueue(this.email, {
      kind: "Reseña editada",
      detail: `«${next.title}» sobre ${editedAgency?.name ?? "una ficha"} vuelve a la cola.`,
    });
    return next;
  }

  async remove(user: User | undefined, reviewId: string): Promise<Review> {
    if (!isAccountVerified(user)) {
      throw new ReviewError("Account verification required");
    }
    const review = await this.ownedReview(user.id, reviewId);
    const next: Review = {
      ...review,
      deletedAt: new Date(),
      moderated: false,
      flagged: true,
    };
    await this.repo.updateReview(next);
    return next;
  }

  async markHelpful(user: User | undefined, reviewId: string) {
    if (!isAccountVerified(user)) {
      throw new ReviewError("Account verification required");
    }
    const review = await this.repo.findReviewById(reviewId);
    if (!review || !isPublicReview(review)) {
      throw new ReviewError("Reseña no encontrada");
    }
    if (review.userId === user.id) {
      throw new ReviewError("No puedes marcar tu propia reseña como útil");
    }
    return this.repo.addReviewHelpful(user.id, reviewId);
  }

  private async ownedReview(userId: string, reviewId: string) {
    const review = await this.repo.findReviewById(reviewId);
    if (!review || review.deletedAt) {
      throw new ReviewError("Reseña no encontrada");
    }
    if (review.userId !== userId) {
      throw new ReviewError("Solo puedes cambiar las reseñas que has escrito");
    }
    return review;
  }
}

function markedExperience(data: {
  incidentTags?: Review["incidentTags"];
  incidentSentiments?: Review["incidentSentiments"];
}) {
  const incidentSentiments = data.incidentSentiments ?? {};
  const fromSentiments = tagsFromSentiments(incidentSentiments);
  return {
    incidentSentiments,
    incidentTags:
      fromSentiments.length > 0 ? fromSentiments : (data.incidentTags ?? []),
  };
}
