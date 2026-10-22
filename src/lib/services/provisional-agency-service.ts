import { randomUUID } from "node:crypto";

import { z } from "zod";

import { agencyPlaceKey } from "@/lib/domain/agency-identity";
import { buildAgencySlug, ensureUniqueSlug } from "@/lib/domain/agency-slug";
import { brandSlugFromName } from "@/lib/domain/company-presence";
import { normalizeAgencyName } from "@/lib/domain/match";
import {
  reviewAllowedNames,
  screenReviewText,
} from "@/lib/domain/review-prefilter";
import type { Agency, Review, User } from "@/lib/domain/types";
import type { Repository } from "@/lib/repositories/types";
import { ReviewError, ReviewService } from "@/lib/services/review-service";

const listingSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Indica el nombre de la inmobiliaria")
    .max(120),
  city: z.string().trim().min(2, "Indica la ciudad").max(80),
  address: z.string().trim().max(180).optional(),
});

const textSchema = z.object({
  title: z.string().optional(),
  pros: z.string().optional(),
  cons: z.string().optional(),
  publicName: z.string().optional(),
  anonymous: z.boolean().optional(),
  experienceCity: z.string().optional(),
});

export class ProvisionalAgencyService {
  constructor(
    private readonly repo: Repository,
    private readonly reviews: ReviewService,
  ) {}

  async publishWithReview(
    user: User | undefined,
    input: unknown,
    options: { evidencePath?: string } = {},
  ) {
    const listing = listingSchema.parse(input);
    const text = textSchema.parse(input);
    const existing = await this.findMatch(listing.name, listing.city);
    const screen = screenReviewText({
      title: text.title,
      pros: text.pros,
      cons: text.cons,
      publicName: text.anonymous === false ? text.publicName : undefined,
      allowedNames: reviewAllowedNames({
        name: existing?.name ?? listing.name,
        legalName: existing?.legalName,
        brandName: existing?.brandName ?? listing.name,
        cities: [text.experienceCity, listing.city, existing?.city],
      }),
    });
    if (screen.outcome === "block") {
      throw new ReviewError(screen.hits.map((hit) => hit.message).join(" "));
    }

    let createdId: string | null = null;
    try {
      const agency = existing ?? (await this.createProvisional(listing));
      if (!existing) createdId = agency.id;
      const review = await this.reviews.create(
        user,
        {
          ...(typeof input === "object" && input ? input : {}),
          agencyId: agency.id,
        },
        options,
      );
      return {
        agency,
        review,
        createdAgency: !existing,
      };
    } catch (error) {
      if (createdId) await this.repo.deleteAgency(createdId);
      throw error;
    }
  }

  private async findMatch(name: string, city: string) {
    const key = agencyPlaceKey(name, city);
    const nameKey = normalizeAgencyName(name);
    const cityKey = normalizeAgencyName(city);
    const agencies = await this.repo.listAgencies();
    const direct = agencies.find(
      (agency) => agencyPlaceKey(agency.name, agency.city) === key,
    );
    if (direct) return direct;

    for (const agency of agencies) {
      if (normalizeAgencyName(agency.name) !== nameKey) continue;
      const locations = await this.repo.listLocationsByAgency(agency.id);
      const inCity = locations.some(
        (location) =>
          (!location.status || location.status === "publicado") &&
          normalizeAgencyName(location.city) === cityKey,
      );
      if (inCity) return agency;
    }
    return null;
  }

  private async createProvisional(listing: {
    name: string;
    city: string;
    address?: string;
  }): Promise<Agency> {
    const base = buildAgencySlug(listing.name, listing.city);
    const unique = await this.uniqueSlug(base);
    const agency: Agency = {
      id: randomUUID(),
      slug: unique,
      name: listing.name.trim(),
      brandSlug: brandSlugFromName(listing.name),
      brandName: listing.name.trim(),
      address: listing.address?.trim() ?? "",
      city: listing.city.trim(),
      postalCode: "",
      phonePublished: false,
      phone: "",
      email: "",
      claimed: false,
      verified: false,
      premium: false,
      provisional: true,
      createdAt: new Date(),
    };
    await this.repo.createAgency(agency);
    return agency;
  }

  private async uniqueSlug(base: string) {
    const taken = new Set(
      (await this.repo.listAgencies()).map((agency) => agency.slug),
    );
    return ensureUniqueSlug(base, (candidate) => taken.has(candidate));
  }
}

export type ProvisionalReviewResult = {
  agency: Agency;
  review: Review;
  createdAgency: boolean;
};
