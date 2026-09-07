import type { Review, UserRole } from "@/lib/domain/types";

export type RoleRatingSummary = {
  averageRating: number;
  reviewCount: number;
};

export type AgencyRoleRatings = {
  inquilino: RoleRatingSummary;
  propietario: RoleRatingSummary;
  overall: RoleRatingSummary;
};

export function summarizeRoleRatings(
  reviews: Pick<Review, "role" | "rating">[],
): AgencyRoleRatings {
  const byRole = (role: UserRole) => {
    const subset = reviews.filter((r) => r.role === role);
    const reviewCount = subset.length;
    const averageRating =
      reviewCount === 0
        ? 0
        : subset.reduce((sum, r) => sum + r.rating, 0) / reviewCount;
    return { averageRating, reviewCount };
  };

  const overallCount = reviews.length;
  const overallAvg =
    overallCount === 0
      ? 0
      : reviews.reduce((sum, r) => sum + r.rating, 0) / overallCount;

  return {
    inquilino: byRole("inquilino"),
    propietario: byRole("propietario"),
    overall: { averageRating: overallAvg, reviewCount: overallCount },
  };
}
