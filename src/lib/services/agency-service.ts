import { randomUUID } from "node:crypto";

import { isAccountVerified } from "@/lib/domain/identity";
import { isPublicReview } from "@/lib/domain/review-visibility";
import { cityToSlug } from "@/lib/domain/city";
import {
  brandScoreApplies,
  presenceCities,
  servesCity,
} from "@/lib/domain/company-presence";
import {
  sortAgencies,
  type AgencySort,
} from "@/lib/domain/agency-browse";
import {
  agencyTextMatchesQuery,
  collectAgencyMatches,
  normalizeAgencyName,
} from "@/lib/domain/match";
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
import { notifyModerationQueue } from "@/lib/ops/moderation-alert";
import type { Repository } from "@/lib/repositories/types";
import type { EmailProvider } from "@/lib/services/email-provider";

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
  band: "exact" | "probable" | "exploratory";
  matchedOn: string;
  roleRatings: ReturnType<typeof summarizeRoleRatings>;
  url: string;
};

export type AgencyMatchReport = {
  identified: AgencyMatchResult[];
  hints: AgencyMatchResult[];
};

export type CityExploreSummary = {
  city: string;
  slug: string;
  agencyCount: number;
  reviewCount: number;
};

export class AgencyService {
  constructor(
    private readonly repo: Repository,
    private readonly email?: EmailProvider,
  ) {}

  async search(
    query?: string,
    options?: { publicOnly?: boolean; sort?: AgencySort },
  ) {
    const agencies = await this.repo.listAgencies();
    const locations = await this.locationsByAgency();
    const aliases = query?.trim() ? await this.repo.listAllAliases() : [];

    const filtered = query?.trim()
      ? agencies.filter((agency) =>
          this.matchesQuery(
            agency,
            locations.get(agency.id) ?? [],
            aliases,
            query,
          ),
        )
      : agencies;

    const withStats = await Promise.all(
      filtered.map((agency) => this.withStats(agency, options)),
    );

    return sortAgencies(
      withStats.map((agency) => ({
        ...agency,
        presenceCities: presenceCities(agency, locations.get(agency.id) ?? []),
      })),
      options?.sort ?? "reviews",
    );
  }

  async listByCity(
    citySlug: string,
    options?: { publicOnly?: boolean; query?: string; sort?: AgencySort },
  ) {
    const agencies = await this.repo.listAgencies();
    const locations = await this.locationsByAgency();
    const inCity = agencies.filter((agency) =>
      servesCity(agency, locations.get(agency.id) ?? [], citySlug),
    );
    const aliases = options?.query?.trim() ? await this.repo.listAllAliases() : [];
    const filtered = options?.query?.trim()
      ? inCity.filter((agency) =>
          this.matchesQuery(
            agency,
            locations.get(agency.id) ?? [],
            aliases,
            options.query ?? "",
          ),
        )
      : inCity;
    const withStats = await Promise.all(
      filtered.map((a) => this.withStats(a, options)),
    );
    return sortAgencies(
      withStats.map((agency) => ({
        ...agency,
        presenceCities: presenceCities(agency, locations.get(agency.id) ?? []),
      })),
      options?.sort ?? "reviews",
    );
  }

  async exploreCities(options?: { publicOnly?: boolean }) {
    const [agencies, locations, reviews] = await Promise.all([
      this.repo.listAgencies(),
      this.locationsByAgency(),
      this.repo.listReviewVisibility(),
    ]);
    const reviewCountByAgency = new Map<string, number>();
    for (const review of reviews) {
      if (review.deletedAt) continue;
      if (options?.publicOnly !== false && !isPublicReview(review)) continue;
      reviewCountByAgency.set(
        review.agencyId,
        (reviewCountByAgency.get(review.agencyId) ?? 0) + 1,
      );
    }

    const map = new Map<string, CityExploreSummary>();

    for (const agency of agencies) {
      const reviewCount = reviewCountByAgency.get(agency.id) ?? 0;
      for (const city of presenceCities(agency, locations.get(agency.id) ?? [])) {
        const slug = cityToSlug(city);
        const current = map.get(slug) ?? {
          city,
          slug,
          agencyCount: 0,
          reviewCount: 0,
        };
        current.agencyCount += 1;
        current.reviewCount += reviewCount;
        map.set(slug, current);
      }
    }

    return [...map.values()].sort((a, b) => a.city.localeCompare(b.city, "es"));
  }

  async namesACity(name: string) {
    const label = normalizeAgencyName(name);
    if (!label) return false;
    const cities = await this.exploreCities();
    return cities.some((city) => normalizeAgencyName(city.city) === label);
  }

  async matchByName(
    name: string,
    city?: string,
    options?: { publicOnly?: boolean },
  ): Promise<AgencyMatchReport> {
    if (await this.namesACity(name)) return { identified: [], hints: [] };
    const agencies = await this.repo.listAgencies();
    const aliases = await this.repo.listAllAliases();
    const locations = await this.locationsByAgency();
    const normalizedCity = city?.trim();
    const allowedIds = normalizedCity
      ? new Set(
          agencies
            .filter((agency) =>
              servesCity(agency, locations.get(agency.id) ?? [], normalizedCity),
            )
            .map((agency) => agency.id),
        )
      : undefined;
    const collected = collectAgencyMatches(name, agencies, aliases, { allowedIds });
    const byId = new Map(agencies.map((agency) => [agency.id, agency]));

    const hydrate = async (hits: typeof collected.identified) => {
      const rows: AgencyMatchResult[] = [];
      for (const hit of hits) {
        const agency = byId.get(hit.id);
        if (!agency) continue;
        const stats = await this.withStats(agency, options);
        rows.push({
          agency,
          slug: agency.slug,
          confidence: hit.confidence,
          band: hit.band,
          matchedOn: hit.matchedOn,
          roleRatings: stats.roleRatings,
          url: `/agencias/${agency.slug}`,
        });
      }
      return rows;
    };

    return {
      identified: await hydrate(collected.identified),
      hints: await hydrate(collected.hints),
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
    if (location.status === "pendiente") {
      const agency = await this.repo.findAgencyById(location.agencyId);
      await notifyModerationQueue(this.email, {
        kind: "Ubicación",
        detail: `${location.address}, ${location.city}, en ${agency?.name ?? "una ficha"}.`,
      });
    }
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
      status: options?.publishNow && data.kind !== "logo" ? "aprobado" : "pendiente",
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
      resolvedAt:
        options?.publishNow && data.kind !== "logo" ? new Date() : undefined,
    };
    await this.repo.createTip(tip);
    if (tip.status === "pendiente") {
      await notifyModerationQueue(this.email, {
        kind: "Aporte a una ficha",
        detail: `${tip.kind} en ${agency.name} (${agency.city}).`,
      });
    }
    if (options?.publishNow && data.kind !== "logo") {
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
      return;
    }

    if (tip.kind === "logo" && tip.evidencePath) {
      agency.logoPath = tip.evidencePath;
      await this.repo.updateAgency(agency);
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
      presenceCities: presenceCities(agency, visibleLocations),
      aliases,
      locations: visibleLocations,
      reviews: reviewsWithResponses.sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
      ),
    };
  }

  async findCanonicalSlug(slug: string) {
    const current = await this.repo.findAgencyBySlug(slug);
    if (current) return current.slug;
    const id = await this.repo.findAgencyIdByLegacySlug(slug);
    if (!id) return null;
    const agency = await this.repo.findAgencyById(id);
    return agency?.slug ?? null;
  }

  async brandBanners(agencies: { brandSlug?: string; brandName?: string; name: string; id: string; cif?: string }[]) {
    const groups = new Map<string, typeof agencies>();
    for (const agency of agencies) {
      if (!agency.brandSlug) continue;
      const group = groups.get(agency.brandSlug) ?? [];
      group.push(agency);
      groups.set(agency.brandSlug, group);
    }
    const banners = [];
    for (const group of groups.values()) {
      if (!brandScoreApplies(group)) continue;
      const rollup = await this.brandRollup(group[0]!);
      if (rollup) banners.push(rollup);
    }
    return banners;
  }

  async brandRollup(agency: { id: string; brandSlug?: string; brandName?: string; name: string }) {
    if (!agency.brandSlug) return null;
    const agencies = (await this.repo.listAgencies()).filter(
      (item) => item.brandSlug === agency.brandSlug,
    );
    if (!brandScoreApplies(agencies)) return null;
    const reviews = (
      await Promise.all(
        agencies.map((item) => this.repo.listReviewsByAgency(item.id)),
      )
    ).flat();
    const visible = await this.filterReviews(reviews, { publicOnly: true });
    return {
      brandName: agency.brandName || agency.name,
      companyCount: agencies.length,
      roleRatings: summarizeRoleRatings(visible),
    };
  }

  private matchesQuery(
    agency: Agency,
    locations: AgencyLocation[],
    aliases: AgencyNameAlias[],
    query: string,
  ) {
    return agencyTextMatchesQuery(query, [
      agency.name,
      ...presenceCities(agency, locations),
      ...aliases
        .filter((alias) => alias.agencyId === agency.id)
        .map((alias) => alias.alias),
    ]);
  }

  private async locationsByAgency() {
    const locations = await this.repo.listPublishedLocations();
    const map = new Map<string, typeof locations>();
    for (const location of locations) {
      const current = map.get(location.agencyId) ?? [];
      current.push(location);
      map.set(location.agencyId, current);
    }
    return map;
  }

  private async filterReviews(reviews: Review[], options?: { publicOnly?: boolean }) {
    const active = reviews.filter((review) => !review.deletedAt);
    if (options?.publicOnly === false) return active;
    return active.filter(isPublicReview);
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
