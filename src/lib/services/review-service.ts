import { randomUUID } from "node:crypto";

import { isAccountVerified } from "@/lib/domain/identity";
import { composeReviewBody } from "@/lib/domain/review-copy";
import type { Review, User } from "@/lib/domain/types";
import { reviewInputSchema } from "@/lib/domain/validation";
import type { Repository } from "@/lib/repositories/types";

const RATE_LIMIT_MS = 7 * 24 * 60 * 60 * 1000;

export class ReviewError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ReviewError";
  }
}

export class ReviewService {
  constructor(private readonly repo: Repository) {}

  async create(user: User | undefined, input: unknown): Promise<Review> {
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
        r.agencyId === agencyId &&
        Date.now() - r.createdAt.getTime() < RATE_LIMIT_MS,
    );

    if (recent) {
      throw new ReviewError("Rate limit: one review per agency every 7 days");
    }

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
      incidentTags: data.incidentTags ?? [],
      createdAt: new Date(),
      moderated: false,
      flagged: false,
    };

    await this.repo.createReview(review);
    return review;
  }

  async markHelpful(user: User | undefined, reviewId: string) {
    if (!isAccountVerified(user)) {
      throw new ReviewError("Account verification required");
    }
    const review = await this.repo.findReviewById(reviewId);
    if (!review || !review.moderated || review.flagged) {
      throw new ReviewError("Reseña no encontrada");
    }
    if (review.userId === user.id) {
      throw new ReviewError("No puedes marcar tu propia reseña como útil");
    }
    return this.repo.addReviewHelpful(user.id, reviewId);
  }
}
