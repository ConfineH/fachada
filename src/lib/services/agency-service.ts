import { randomUUID } from "node:crypto";

import { isAccountVerified } from "@/lib/domain/identity";
import { cityToSlug } from "@/lib/domain/city";
import { matchScore } from "@/lib/domain/match";
import { summarizeRoleRatings } from "@/lib/domain/ratings";
import type {
  Agency,
  AgencyLocation,
  AgencyNameAlias,
  AgencyTip,
  Review,
  User,
} from "@/lib/domain/types";
import {
  agencyLocationInputSchema,
  agencyTipInputSchema,
} from "@/lib/domain/validation";
import type { Repository } from "@/lib/repositories/types";

export class AgencyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AgencyError";
  }
}

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

  async addLocation(
    agencyId: string,
    input: {
      kind: AgencyLocation["kind"];
      status: AgencyLocation["status"];
      address: string;
      city: string;
      postalCode: string;
      label?: string;
      note?: string;
      sourceUrl?: string;
    },
  ) {
    const location: AgencyLocation = {
      id: randomUUID(),
      agencyId,
      kind: input.kind,
      status: input.status,
      address: input.address.trim(),
      city: input.city.trim(),
      postalCode: input.postalCode.trim(),
      label: input.label?.trim() || undefined,
      note: input.note?.trim() || undefined,
      sourceUrl: input.sourceUrl?.trim() || undefined,
      createdAt: new Date(),
    };
    await this.repo.createLocation(location);
    return location;
  }

  async suggestLocation(user: User | undefined, slug: string, input: unknown) {
    if (!isAccountVerified(user)) {
      throw new AgencyError("Account verification required");
    }
    const agency = await this.repo.findAgencyBySlug(slug);
    if (!agency) throw new AgencyError("Agency not found");
    const data = agencyLocationInputSchema.parse(input);
    return this.addLocation(agency.id, {
      kind: "reported",
      status: "pendiente",
      address: data.address,
      city: data.city,
      postalCode: data.postalCode ?? "",
      label: data.label,
      note: data.note,
    });
  }

  async submitTip(
    user: User | undefined,
    slug: string,
    input: unknown,
    options?: { publishNow?: boolean },
  ) {
    if (!isAccountVerified(user)) {
      throw new AgencyError("Account verification required");
    }
    const agency = await this.repo.findAgencyBySlug(slug);
    if (!agency) throw new AgencyError("Agency not found");
    const data = agencyTipInputSchema.parse(input);

    if (!options?.publishNow) {
      const pending = await this.repo.countPendingTips(user.id, agency.id);
      if (pending >= 8) {
        throw new AgencyError(
          "Ya tienes varios aportes pendientes en esta ficha. Espera a que los revisemos.",
        );
      }
    }

    const tip: AgencyTip = {
      id: randomUUID(),
      agencyId: agency.id,
      userId: user.id,
      kind: data.kind,
      status: options?.publishNow ? "aprobado" : "pendiente",
      address: data.address,
      city: data.city,
      postalCode: data.postalCode,
      label: data.label,
      alias: data.alias,
      year: data.year,
      note: data.note,
      sourceUrl: data.sourceUrl,
      evidencePath: data.evidencePath,
      createdAt: new Date(),
      resolvedAt: options?.publishNow ? new Date() : undefined,
    };
    await this.repo.createTip(tip);
    if (options?.publishNow) {
      await this.applyTip(tip);
    }
    return tip;
  }

  async applyTip(tip: AgencyTip) {
    const agency = await this.repo.findAgencyById(tip.agencyId);
    if (!agency) throw new AgencyError("Agency not found");

    if (tip.kind === "principal" && tip.address && tip.city) {
      agency.address = tip.address;
      agency.city = tip.city;
      agency.postalCode = tip.postalCode ?? agency.postalCode;
      await this.repo.updateAgency(agency);
      return;
    }

    if (tip.kind === "branch" && tip.address && tip.city) {
      await this.addLocation(agency.id, {
        kind: "branch",
        status: "publicado",
        address: tip.address,
        city: tip.city,
        postalCode: tip.postalCode ?? "",
        label: tip.label,
        note: tip.note,
        sourceUrl: tip.sourceUrl,
      });
      return;
    }

    if ((tip.kind === "former_name" || tip.kind === "legal_name") && tip.alias) {
      const alias: AgencyNameAlias = {
        id: randomUUID(),
        agencyId: agency.id,
        alias: tip.alias,
        kind: tip.kind === "legal_name" ? "legal" : "former",
        note: tip.note,
        sourceUrl: tip.sourceUrl,
        effectiveUntil:
          tip.kind === "former_name" && tip.year
            ? new Date(Date.UTC(tip.year, 11, 31))
            : undefined,
      };
      await this.repo.createAlias(alias);
      if (tip.kind === "legal_name") {
        agency.legalName = tip.alias;
        await this.repo.updateAgency(agency);
      }
    }
  }

  async getBySlug(slug: string, options?: { publicOnly?: boolean }) {
    const agency = await this.repo.findAgencyBySlug(slug);
    if (!agency) return undefined;

    const [aliases, locations, rawReviews] = await Promise.all([
      this.repo.listAliasesByAgency(agency.id),
      this.repo.listLocationsByAgency(agency.id),
      this.repo.listReviewsByAgency(agency.id),
    ]);
    const visibleLocations =
      options?.publicOnly === false
        ? locations
        : locations.filter((location) => location.status === "publicado");
    const reviews = await this.filterReviews(rawReviews, options);

    const reviewsWithResponses = await Promise.all(
      reviews.map(async (review) => ({
        ...review,
        response: (await this.repo.findResponseByReviewId(review.id)) ?? undefined,
      })),
    );

    return {
      ...(await this.withStats(agency, options)),
      aliases,
      locations: visibleLocations,
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
