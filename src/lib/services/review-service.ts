import { randomUUID } from "node:crypto";

import { isAccountVerified } from "@/lib/domain/identity";
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

    const review: Review = {
      id: randomUUID(),
      userId: user.id,
      agencyId,
      role: data.role,
      rating: data.rating,
      title: data.title,
      body: data.body,
      incidentTags: data.incidentTags ?? [],
      createdAt: new Date(),
      moderated: false,
      flagged: false,
    };

    await this.repo.createReview(review);
    return review;
  }
}
