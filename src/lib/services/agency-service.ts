import type { Agency, AgencyWithStats } from "@/lib/domain/types";
import type { Repository } from "@/lib/repositories/types";

export class AgencyService {
  constructor(private readonly repo: Repository) {}

  search(query?: string): AgencyWithStats[] {
    const normalized = query?.trim().toLowerCase() ?? "";
    const agencies = this.repo.listAgencies();

    const filtered = normalized
      ? agencies.filter(
          (a) =>
            a.name.toLowerCase().includes(normalized) ||
            a.city.toLowerCase().includes(normalized),
        )
      : agencies;

    return filtered
      .map((agency) => this.withStats(agency))
      .sort((a, b) => {
        if (b.averageRating !== a.averageRating) {
          return b.averageRating - a.averageRating;
        }
        return b.reviewCount - a.reviewCount;
      });
  }

  getBySlug(slug: string) {
    const agency = this.repo.findAgencyBySlug(slug);
    if (!agency) return undefined;
    return {
      ...this.withStats(agency),
      reviews: this.repo
        .listReviewsByAgency(agency.id)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
    };
  }

  private withStats(agency: Agency): AgencyWithStats {
    const reviews = this.repo.listReviewsByAgency(agency.id);
    const reviewCount = reviews.length;
    const averageRating =
      reviewCount === 0
        ? 0
        : reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount;

    return {
      ...agency,
      averageRating,
      reviewCount,
    };
  }
}
