import { parseIncidentTags } from "@/lib/domain/incidents";
import type {
  Agency,
  AgencyResponse,
  Claim,
  ClaimEvidenceItem,
  PendingVerification,
  Review,
  RepresentativeRole,
  Session,
  User,
} from "@/lib/domain/types";

type AgencyRow = {
  id: string;
  slug: string;
  name: string;
  cif: string | null;
  legal_name: string | null;
  legal_address: string | null;
  address: string;
  city: string;
  postal_code: string;
  phone: string;
  phone_published: boolean | null;
  email: string;
  website: string | null;
  google_maps_url: string | null;
  idealista_url: string | null;
  fotocasa_url: string | null;
  claimed: boolean;
  verified: boolean;
  premium: boolean;
  created_at: string;
};

type UserRow = {
  id: string;
  phone: string | null;
  email: string | null;
  phone_verified: boolean;
  email_verified: boolean | null;
  created_at: string;
  last_activity_at: string;
};

type ReviewRow = {
  id: string;
  user_id: string;
  agency_id: string;
  role: "inquilino" | "propietario";
  rating: number;
  title: string;
  body: string;
  pros: string | null;
  cons: string | null;
  anonymous: boolean | null;
  public_name: string | null;
  would_recommend: boolean | null;
  helpful_count: number | null;
  incident_tags: string[] | null;
  created_at: string;
  moderated: boolean;
  flagged: boolean;
};

type ClaimRow = {
  id: string;
  agency_id: string;
  user_id: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  representative_role: string | null;
  company_cif: string | null;
  evidence: { type: string; url: string }[] | null;
  documentation_urls: string[];
  attestation_accepted: boolean;
  business_phone_verified: boolean;
  verification_path: string | null;
  work_email_domain_match: boolean;
  status: "pendiente" | "aprobado" | "rechazado";
  requested_at: string;
  resolved_at: string | null;
};

type AgencyResponseRow = {
  id: string;
  review_id: string;
  agency_id: string;
  body: string;
  created_at: string;
};

type PendingVerificationRow = {
  phone: string;
  code: string;
  expires_at: string;
};

type SessionRow = {
  token: string;
  user_id: string;
  expires_at: string;
};

export function mapAgency(row: AgencyRow): Agency {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    cif: row.cif ?? undefined,
    legalName: row.legal_name ?? undefined,
    address: row.address,
    legalAddress: row.legal_address ?? undefined,
    city: row.city,
    postalCode: row.postal_code,
    phonePublished: row.phone_published ?? true,
    phone: row.phone,
    email: row.email,
    website: row.website ?? undefined,
    googleMapsUrl: row.google_maps_url ?? undefined,
    idealistaUrl: row.idealista_url ?? undefined,
    fotocasaUrl: row.fotocasa_url ?? undefined,
    claimed: row.claimed,
    verified: row.verified,
    premium: row.premium,
    createdAt: new Date(row.created_at),
  };
}

export function mapUser(row: UserRow): User {
  return {
    id: row.id,
    phone: row.phone ?? undefined,
    email: row.email ?? undefined,
    phoneVerified: row.phone_verified,
    emailVerified: Boolean(row.email_verified),
    createdAt: new Date(row.created_at),
    lastActivityAt: new Date(row.last_activity_at),
  };
}

export function mapReview(row: ReviewRow): Review {
  return {
    id: row.id,
    userId: row.user_id,
    agencyId: row.agency_id,
    role: row.role,
    rating: row.rating,
    title: row.title,
    body: row.body,
    pros: row.pros ?? undefined,
    cons: row.cons ?? undefined,
    anonymous: row.anonymous ?? true,
    publicName: row.public_name ?? undefined,
    wouldRecommend: row.would_recommend ?? undefined,
    helpfulCount: row.helpful_count ?? 0,
    incidentTags: parseIncidentTags(row.incident_tags),
    createdAt: new Date(row.created_at),
    moderated: row.moderated,
    flagged: row.flagged,
  };
}

export function mapClaim(row: ClaimRow): Claim {
  const evidence = (row.evidence ?? []) as ClaimEvidenceItem[];
  return {
    id: row.id,
    agencyId: row.agency_id,
    userId: row.user_id,
    contactName: row.contact_name,
    contactEmail: row.contact_email,
    contactPhone: row.contact_phone,
    representativeRole: (row.representative_role ??
      "otro") as RepresentativeRole,
    companyCif: row.company_cif ?? undefined,
    evidence,
    documentationUrls:
      row.documentation_urls?.length > 0
        ? row.documentation_urls
        : evidence.map((e) => e.url),
    attestationAccepted: row.attestation_accepted ?? false,
    businessPhoneVerified: row.business_phone_verified ?? false,
    verificationPath:
      (row.verification_path as Claim["verificationPath"]) ?? "business_phone",
    workEmailDomainMatch: row.work_email_domain_match ?? false,
    status: row.status,
    requestedAt: new Date(row.requested_at),
    resolvedAt: row.resolved_at ? new Date(row.resolved_at) : undefined,
  };
}

export function mapAgencyResponse(row: AgencyResponseRow): AgencyResponse {
  return {
    id: row.id,
    reviewId: row.review_id,
    agencyId: row.agency_id,
    body: row.body,
    createdAt: new Date(row.created_at),
  };
}

export function mapPendingVerification(
  row: PendingVerificationRow,
): PendingVerification {
  return {
    phone: row.phone,
    code: row.code,
    expiresAt: new Date(row.expires_at),
  };
}

export function mapSession(row: SessionRow): Session {
  return {
    token: row.token,
    userId: row.user_id,
    expiresAt: new Date(row.expires_at),
  };
}

export type {
  AgencyRow,
  UserRow,
  ReviewRow,
  ClaimRow,
  AgencyResponseRow,
  PendingVerificationRow,
  SessionRow,
};
