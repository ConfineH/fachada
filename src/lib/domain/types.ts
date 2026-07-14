export type UserRole = "inquilino" | "propietario";

export type ClaimStatus = "pendiente" | "aprobado" | "rechazado";

export interface User {
  id: string;
  phone: string;
  phoneVerified: boolean;
  createdAt: Date;
  lastActivityAt: Date;
}

export interface Agency {
  id: string;
  slug: string;
  name: string;
  cif?: string;
  address: string;
  city: string;
  postalCode: string;
  phone: string;
  email: string;
  website?: string;
  googleMapsUrl?: string;
  claimed: boolean;
  verified: boolean;
  premium: boolean;
  createdAt: Date;
}

export interface Review {
  id: string;
  userId: string;
  agencyId: string;
  role: UserRole;
  rating: number;
  title: string;
  body: string;
  createdAt: Date;
  moderated: boolean;
  flagged: boolean;
}

export interface Claim {
  id: string;
  agencyId: string;
  userId: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  documentationUrls: string[];
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
}

export interface ReviewWithResponse extends Review {
  response?: AgencyResponse;
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
