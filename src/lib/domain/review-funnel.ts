import {
  REVIEW_ORIGINS,
  REVIEW_ORIGIN_LABELS,
  type ReviewOrigin,
} from "@/lib/domain/review-origin";
import { isPublicReview } from "@/lib/domain/review-visibility";

export type FunnelReview = {
  agencyId: string;
  moderated: boolean;
  flagged: boolean;
  deletedAt?: Date;
  origen?: string;
};

export type ReviewOriginCount = {
  origen: ReviewOrigin;
  label: string;
  submitted: number;
  published: number;
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

export function summarizeReviewOrigins(reviews: FunnelReview[]): ReviewOriginCount[] {
  const active = reviews.filter((review) => !review.deletedAt);
  return REVIEW_ORIGINS.map((origen) => {
    const matching = active.filter((review) => review.origen === origen);
    return {
      origen,
      label: REVIEW_ORIGIN_LABELS[origen],
      submitted: matching.length,
      published: matching.filter((review) => isPublicReview(review)).length,
    };
  });
}
