export const REVIEWS_PER_AGENCY_PER_ACCOUNT = 1;
export const REVIEWS_PER_ACCOUNT_PER_DAY = 3;
const DAY_MS = 24 * 60 * 60 * 1000;

type LimitedReview = {
  agencyId: string;
  createdAt: Date;
  deletedAt?: Date;
};

export function reviewRateLimitMessage(
  reviews: LimitedReview[],
  agencyId: string,
  now = new Date(),
): string | null {
  const active = reviews.filter((review) => !review.deletedAt);
  if (active.some((review) => review.agencyId === agencyId)) {
    return "Solo puedes publicar una reseña por inmobiliaria con esta cuenta.";
  }
  const dayAgo = now.getTime() - DAY_MS;
  const today = active.filter((review) => review.createdAt.getTime() >= dayAgo);
  if (today.length >= REVIEWS_PER_ACCOUNT_PER_DAY) {
    return "Has llegado al límite de 3 reseñas en 24 horas.";
  }
  return null;
}
