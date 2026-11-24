import type { AgencyRoleRatings } from "@/lib/domain/ratings";

import type { PreviewReview } from "@/lib/preview/fixtures";

export function roleRatingsFor(reviews: PreviewReview[]): AgencyRoleRatings {
  const byRole = (role: PreviewReview["role"]) => {
    const subset = reviews.filter((review) => review.role === role);
    const reviewCount = subset.length;
    const averageRating =
      reviewCount === 0
        ? 0
        : subset.reduce((sum, review) => sum + review.rating, 0) / reviewCount;
    return { averageRating, reviewCount };
  };
  const reviewCount = reviews.length;
  return {
    inquilino: byRole("inquilino"),
    propietario: byRole("propietario"),
    overall: {
      reviewCount,
      averageRating:
        reviewCount === 0
          ? 0
          : reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount,
    },
  };
}

export function cityLabel(city: string | null | undefined) {
  const trimmed = city?.trim();
  return trimmed ? trimmed : "Ciudad no indicada";
}

export function reviewsForCityFilter(reviews: PreviewReview[], city: string | null) {
  if (!city) {
    return { visible: reviews, omittedWithoutCity: 0 };
  }
  const needle = city.toLocaleLowerCase("es");
  const visible = reviews.filter(
    (review) => review.experienceCity?.trim().toLocaleLowerCase("es") === needle,
  );
  const omittedWithoutCity = reviews.filter((review) => !review.experienceCity?.trim()).length;
  return { visible, omittedWithoutCity };
}
