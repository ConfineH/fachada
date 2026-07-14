import type {
  Agency,
  AgencyResponse,
  Claim,
  PendingVerification,
  Review,
  Session,
  User,
} from "@/lib/domain/types";

type AgencyRow = {
  id: string;
  slug: string;
  name: string;
  cif: string | null;
  address: string;
  city: string;
  postal_code: string;
  phone: string;
  email: string;
  website: string | null;
  google_maps_url: string | null;
  claimed: boolean;
  verified: boolean;
  premium: boolean;
  created_at: string;
};

type UserRow = {
  id: string;
  phone: string;
  phone_verified: boolean;
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
  documentation_urls: string[];
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
    address: row.address,
    city: row.city,
    postalCode: row.postal_code,
    phone: row.phone,
    email: row.email,
    website: row.website ?? undefined,
    googleMapsUrl: row.google_maps_url ?? undefined,
    claimed: row.claimed,
    verified: row.verified,
    premium: row.premium,
    createdAt: new Date(row.created_at),
  };
}

export function mapUser(row: UserRow): User {
  return {
    id: row.id,
    phone: row.phone,
    phoneVerified: row.phone_verified,
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
    createdAt: new Date(row.created_at),
    moderated: row.moderated,
    flagged: row.flagged,
  };
}

export function mapClaim(row: ClaimRow): Claim {
  return {
    id: row.id,
    agencyId: row.agency_id,
    userId: row.user_id,
    contactName: row.contact_name,
    contactEmail: row.contact_email,
    contactPhone: row.contact_phone,
    documentationUrls: row.documentation_urls,
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
