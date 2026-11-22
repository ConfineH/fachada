import { agencyHasPublishedPhone, publicAgencyEmail } from "@/lib/domain/agency-contact";
import { isPublicReview } from "@/lib/domain/review-visibility";
import { reviewPublicCopy } from "@/lib/domain/review-copy";
import { publicRoleRatings, type AgencyRoleRatings } from "@/lib/domain/ratings";
import type {
  Agency,
  AgencyLocation,
  AgencyNameAlias,
  AgencyResponse,
  Review,
} from "@/lib/domain/types";
import { agencyLogoUrl } from "@/lib/ops/agency-logos";

type Dated = Date | string | undefined;

function iso(value: Dated) {
  if (!value) return undefined;
  return value instanceof Date ? value.toISOString() : value;
}

export type PublicAgencySource = Agency & {
  reviewCount?: number;
  roleRatings: AgencyRoleRatings;
  presenceCities?: string[];
  aliases?: AgencyNameAlias[];
  locations?: AgencyLocation[];
  reviews?: Array<Review & { response?: AgencyResponse }>;
};

export function publicReview(review: Review & { response?: AgencyResponse }) {
  const copy = reviewPublicCopy(review);
  return {
    id: review.id,
    role: review.role,
    rating: review.rating,
    anonymous: review.anonymous,
    publicName: review.anonymous ? undefined : review.publicName,
    wouldRecommend: review.wouldRecommend,
    helpfulCount: review.helpfulCount,
    incidentTags: review.incidentTags,
    incidentSentiments: review.incidentSentiments,
    experienceDate: iso(review.experienceDate),
    experienceType: review.experienceType,
    experienceCity: review.experienceCity?.trim() || undefined,
    verificationLevel: review.verificationLevel,
    identityVerification: review.identityVerification,
    createdAt: iso(review.createdAt),
    editedAt: iso(review.editedAt),
    title: copy.title,
    narrative: copy.narrative,
    prose: copy.prose,
    pros: copy.pros,
    cons: copy.cons,
    response: review.response
      ? {
          body: review.response.body,
          createdAt: iso(review.response.createdAt),
        }
      : undefined,
  };
}

export function publicAgencySummary(agency: PublicAgencySource) {
  return {
    id: agency.id,
    slug: agency.slug,
    name: agency.name,
    legalName: agency.legalName,
    cif: agency.cif,
    address: agency.address,
    legalAddress: agency.legalAddress,
    city: agency.city,
    postalCode: agency.postalCode,
    phonePublished: agency.phonePublished,
    phone: agencyHasPublishedPhone(agency) ? agency.phone : undefined,
    email: publicAgencyEmail(agency.email),
    website: agency.website,
    googleMapsUrl: agency.googleMapsUrl,
    idealistaUrl: agency.idealistaUrl,
    fotocasaUrl: agency.fotocasaUrl,
    claimed: agency.claimed,
    verified: agency.verified,
    provisional: agency.provisional,
    brandName: agency.brandName,
    logoUrl: agencyLogoUrl(agency.logoPath),
    presenceCities: agency.presenceCities ?? [agency.city],
    reviewCount: agency.reviewCount ?? 0,
    roleRatings: publicRoleRatings(agency.roleRatings),
  };
}

export function publicAgencyDetail(agency: PublicAgencySource) {
  return {
    ...publicAgencySummary(agency),
    aliases: (agency.aliases ?? []).map((alias) => ({
      id: alias.id,
      alias: alias.alias,
      kind: alias.kind,
      effectiveUntil: iso(alias.effectiveUntil),
    })),
    locations: (agency.locations ?? [])
      .filter((location) => location.status === "publicado")
      .map((location) => ({
        id: location.id,
        kind: location.kind,
        label: location.label,
        address: location.address,
        city: location.city,
        postalCode: location.postalCode,
      })),
    reviews: (agency.reviews ?? [])
      .filter((review) => isPublicReview(review))
      .map(publicReview),
  };
}
