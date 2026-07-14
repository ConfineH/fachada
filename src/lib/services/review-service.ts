import { randomUUID } from "node:crypto";

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
    if (!user?.phoneVerified) {
      throw new ReviewError("Phone verification required");
    }

    const data = reviewInputSchema.parse(input);
    const agency = await this.repo.findAgencyById(data.agencyId);
    if (!agency) throw new ReviewError("Agency not found");

    const userReviews = await this.repo.listReviewsByUser(user.id);
    const recent = userReviews.find(
      (r) =>
        r.agencyId === data.agencyId &&
        Date.now() - r.createdAt.getTime() < RATE_LIMIT_MS,
    );

    if (recent) {
      throw new ReviewError("Rate limit: one review per agency every 7 days");
    }

    const review: Review = {
      id: randomUUID(),
      userId: user.id,
      agencyId: data.agencyId,
      role: data.role,
      rating: data.rating,
      title: data.title,
      body: data.body,
      createdAt: new Date(),
      moderated: false,
      flagged: false,
    };

    await this.repo.createReview(review);
    return review;
  }
}
