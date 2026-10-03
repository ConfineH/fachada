import { isPublicReview } from "@/lib/domain/review-visibility";

export type FunnelReview = {
  agencyId: string;
  moderated: boolean;
  flagged: boolean;
  deletedAt?: Date;
};

export type ReviewFunnel = {
  submitted: number;
  pending: number;
  published: number;
  flagged: number;
  agenciesWithPublishedReview: number;
};

export function summarizeReviewFunnel(reviews: FunnelReview[]): ReviewFunnel {
  const active = reviews.filter((review) => !review.deletedAt);
  const published = active.filter((review) => isPublicReview(review));
  const flagged = active.filter((review) => review.flagged);
  const pending = active.filter(
    (review) => !review.moderated && !review.flagged,
  );
  return {
    submitted: active.length,
    pending: pending.length,
    published: published.length,
    flagged: flagged.length,
    agenciesWithPublishedReview: new Set(
      published.map((review) => review.agencyId),
    ).size,
  };
}
