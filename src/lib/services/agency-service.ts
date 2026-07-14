import type { Agency, AgencyWithStats } from "@/lib/domain/types";
import type { Repository } from "@/lib/repositories/types";

export class AgencyService {
  constructor(private readonly repo: Repository) {}

  async search(query?: string): Promise<AgencyWithStats[]> {
    const normalized = query?.trim().toLowerCase() ?? "";
    const agencies = await this.repo.listAgencies();

    const filtered = normalized
      ? agencies.filter(
          (a) =>
            a.name.toLowerCase().includes(normalized) ||
            a.city.toLowerCase().includes(normalized),
        )
      : agencies;

    const withStats = await Promise.all(
      filtered.map((agency) => this.withStats(agency)),
    );

    return withStats.sort((a, b) => {
      if (b.averageRating !== a.averageRating) {
        return b.averageRating - a.averageRating;
      }
      return b.reviewCount - a.reviewCount;
    });
  }

  async getBySlug(slug: string) {
    const agency = await this.repo.findAgencyBySlug(slug);
    if (!agency) return undefined;

    const reviews = await this.repo.listReviewsByAgency(agency.id);
    return {
      ...(await this.withStats(agency)),
      reviews: reviews.sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
      ),
    };
  }

  private async withStats(agency: Agency): Promise<AgencyWithStats> {
    const reviews = await this.repo.listReviewsByAgency(agency.id);
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
