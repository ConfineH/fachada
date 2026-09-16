import type { Review } from "@/lib/domain/types";

type ReviewVisibility = Pick<Review, "moderated" | "flagged" | "deletedAt">;

export function isPublicReview(review: ReviewVisibility) {
  return Boolean(review.moderated && !review.flagged && !review.deletedAt);
}
