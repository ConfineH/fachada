import { randomUUID } from "node:crypto";

import type { Review } from "@/lib/domain/types";
import { cityToSlug } from "@/lib/domain/city";
import { matchScore } from "@/lib/domain/match";
import { summarizeRoleRatings } from "@/lib/domain/ratings";
import type { Agency, AgencyNameAlias } from "@/lib/domain/types";
import type { Repository } from "@/lib/repositories/types";

export type AgencyMatchResult = {
  agency: Agency;
  slug: string;
  confidence: number;
  roleRatings: ReturnType<typeof summarizeRoleRatings>;
  url: string;
};

export type CityExploreSummary = {
  city: string;
  slug: string;
  agencyCount: number;
  reviewCount: number;
};

export class AgencyService {
  constructor(private readonly repo: Repository) {}

  async search(query?: string, options?: { publicOnly?: boolean }) {
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
      filtered.map((agency) => this.withStats(agency, options)),
    );

    return withStats.sort((a, b) => {
      if (b.averageRating !== a.averageRating) {
        return b.averageRating - a.averageRating;
      }
      return b.reviewCount - a.reviewCount;
    });
  }

  async listByCity(citySlug: string, options?: { publicOnly?: boolean }) {
    const agencies = await this.repo.listAgencies();
    const filtered = agencies.filter((a) => cityToSlug(a.city) === citySlug);
    return Promise.all(filtered.map((a) => this.withStats(a, options)));
  }

  async exploreCities(options?: { publicOnly?: boolean }) {
    const agencies = await this.repo.listAgencies();
    const map = new Map<string, CityExploreSummary>();

    for (const agency of agencies) {
      const slug = cityToSlug(agency.city);
      const reviews = await this.filterReviews(
        await this.repo.listReviewsByAgency(agency.id),
        options,
      );
      const current = map.get(slug) ?? {
        city: agency.city,
        slug,
        agencyCount: 0,
        reviewCount: 0,
      };
      current.agencyCount += 1;
      current.reviewCount += reviews.length;
      map.set(slug, current);
    }

    return [...map.values()].sort((a, b) => a.city.localeCompare(b.city, "es"));
  }

  async matchByName(
    name: string,
    city?: string,
    options?: { publicOnly?: boolean },
  ): Promise<AgencyMatchResult | null> {
    const agencies = await this.repo.listAgencies();
    const aliases = await this.repo.listAllAliases();
    const normalizedCity = city?.trim().toLowerCase();

    let best: { agency: Agency; confidence: number } | null = null;

    for (const agency of agencies) {
      if (normalizedCity && agency.city.toLowerCase() !== normalizedCity) {
        continue;
      }

      const candidates = [
        agency.name,
        ...aliases
          .filter((a) => a.agencyId === agency.id)
          .map((a) => a.alias),
      ];

      for (const candidate of candidates) {
        const confidence = matchScore(name, candidate);
        if (!best || confidence > best.confidence) {
          best = { agency, confidence };
        }
      }
    }

    if (!best || best.confidence < 0.45) return null;

    const stats = await this.withStats(best.agency, options);
    return {
      agency: best.agency,
      slug: best.agency.slug,
      confidence: best.confidence,
      roleRatings: stats.roleRatings,
      url: `/agencias/${best.agency.slug}`,
    };
  }

  async updatePublicProfile(
    slug: string,
    input: {
      website?: string;
      googleMapsUrl?: string;
      idealistaUrl?: string;
      fotocasaUrl?: string;
      alias?: string;
    },
  ) {
    const agency = await this.repo.findAgencyBySlug(slug);
    if (!agency) return null;

    const applyUrl = (current: string | undefined, incoming?: string) => {
      if (incoming === undefined) return current;
      const trimmed = incoming.trim();
      return trimmed ? trimmed : undefined;
    };

    const next: Agency = {
      ...agency,
      website: applyUrl(agency.website, input.website),
      googleMapsUrl: applyUrl(agency.googleMapsUrl, input.googleMapsUrl),
      idealistaUrl: applyUrl(agency.idealistaUrl, input.idealistaUrl),
      fotocasaUrl: applyUrl(agency.fotocasaUrl, input.fotocasaUrl),
    };

    await this.repo.updateAgency(next);

    const alias = input.alias?.trim();
    if (alias) {
      await this.repo.createAlias({
        id: randomUUID(),
        agencyId: agency.id,
        alias,
        kind: "commercial",
      });
    }

    return this.getBySlug(slug, { publicOnly: false });
  }

  async getBySlug(slug: string, options?: { publicOnly?: boolean }) {
    const agency = await this.repo.findAgencyBySlug(slug);
    if (!agency) return undefined;

    const aliases = await this.repo.listAliasesByAgency(agency.id);
    const reviews = await this.filterReviews(
      await this.repo.listReviewsByAgency(agency.id),
      options,
    );

    const reviewsWithResponses = await Promise.all(
      reviews.map(async (review) => ({
        ...review,
        response: (await this.repo.findResponseByReviewId(review.id)) ?? undefined,
      })),
    );

    return {
      ...(await this.withStats(agency, options)),
      aliases,
      reviews: reviewsWithResponses.sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
      ),
    };
  }

  private async filterReviews(reviews: Review[], options?: { publicOnly?: boolean }) {
    if (options?.publicOnly === false) return reviews;
    return reviews.filter((r) => r.moderated && !r.flagged);
  }

  private async withStats(agency: Agency, options?: { publicOnly?: boolean }) {
    const reviews = await this.filterReviews(
      await this.repo.listReviewsByAgency(agency.id),
      options,
    );
    const roleRatings = summarizeRoleRatings(reviews);

    return {
      ...agency,
      averageRating: roleRatings.overall.averageRating,
      reviewCount: roleRatings.overall.reviewCount,
      roleRatings,
    };
  }
}

export type { AgencyNameAlias };
