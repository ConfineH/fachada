import type { IncidentTag } from "@/lib/domain/incidents";
import type { AgencyRoleRatings } from "@/lib/domain/ratings";

export type UserRole = "inquilino" | "propietario";

export type ClaimStatus = "pendiente" | "aprobado" | "rechazado";

export type AgencySubmissionStatus = "pendiente" | "aprobado" | "rechazado";

export type ClaimEvidenceType =
  | "cif_document"
  | "corporate_registry"
  | "power_of_attorney"
  | "domain_proof"
  | "storefront_video";

export type RepresentativeRole =
  | "director"
  | "administrador"
  | "comercial"
  | "marketing"
  | "rrhh"
  | "otro";

export interface ClaimEvidenceItem {
  type: ClaimEvidenceType;
  url: string;
}

export interface User {
  id: string;
  phone?: string;
  email?: string;
  phoneVerified: boolean;
  emailVerified: boolean;
  createdAt: Date;
  lastActivityAt: Date;
}

export interface Agency {
  id: string;
  slug: string;
  name: string;
  cif?: string;
  legalName?: string;
  /** Oficina principal / sede comercial (lo destacado en ficha). */
  address: string;
  /** Domicilio social o fiscal; bloque legal, no sustituye la oficina. */
  legalAddress?: string;
  city: string;
  postalCode: string;
  /** false cuando el alta indica que no hay teléfono público (contacto no verificado). */
  phonePublished: boolean;
  phone: string;
  email: string;
  website?: string;
  googleMapsUrl?: string;
  idealistaUrl?: string;
  fotocasaUrl?: string;
  claimed: boolean;
  verified: boolean;
  premium: boolean;
  createdAt: Date;
}

export type AgencyAliasKind = "commercial" | "legal";

export interface AgencyNameAlias {
  id: string;
  agencyId: string;
  alias: string;
  kind: AgencyAliasKind;
  effectiveUntil?: Date;
  sourceUrl?: string;
  note?: string;
}

export interface Review {
  id: string;
  userId: string;
  agencyId: string;
  role: UserRole;
  rating: number;
  title: string;
  body: string;
  pros?: string;
  cons?: string;
  anonymous: boolean;
  publicName?: string;
  wouldRecommend?: boolean;
  helpfulCount: number;
  incidentTags: IncidentTag[];
  createdAt: Date;
  moderated: boolean;
  flagged: boolean;
}

export interface AgencySubmission {
  id: string;
  userId: string;
  name: string;
  city: string;
  postalCode: string;
  address: string;
  noPhoneOnline: boolean;
  phone?: string;
  email?: string;
  website?: string;
  idealistaUrl?: string;
  note?: string;
  status: AgencySubmissionStatus;
  createdAt: Date;
  resolvedAt?: Date;
  createdAgencyId?: string;
  createdAgencySlug?: string;
}

export interface Claim {
  id: string;
  agencyId: string;
  userId: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  representativeRole: RepresentativeRole;
  companyCif?: string;
  evidence: ClaimEvidenceItem[];
  documentationUrls: string[];
  attestationAccepted: boolean;
  businessPhoneVerified: boolean;
  /** business_phone = OTP línea publicada; document_only = sin teléfono en ficha */
  verificationPath: "business_phone" | "document_only";
  workEmailDomainMatch: boolean;
  status: ClaimStatus;
  requestedAt: Date;
  resolvedAt?: Date;
}

export interface AgencyResponse {
  id: string;
  reviewId: string;
  agencyId: string;
  body: string;
  createdAt: Date;
}


export interface AgencyWithStats extends Agency {
  averageRating: number;
  reviewCount: number;
  roleRatings: AgencyRoleRatings;
}

export interface ReviewWithResponse extends Review {
  response?: AgencyResponse;
}

export interface PendingEmailVerification {
  email: string;
  code: string;
  expiresAt: Date;
}

export interface PendingVerification {
  phone: string;
  code: string;
  expiresAt: Date;
}

export interface Session {
  token: string;
  userId: string;
  expiresAt: Date;
}
