import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  Agency,
  AgencyResponse,
  AgencySubmission,
  Claim,
  PendingVerification,
  Review,
  Session,
  User,
} from "@/lib/domain/types";

import {
  mapAgency,
  mapAgencyResponse,
  mapClaim,
  mapPendingVerification,
  mapReview,
  mapSession,
  mapUser,
  type AgencyRow,
  type AgencyResponseRow,
  type ClaimRow,
  type PendingVerificationRow,
  type ReviewRow,
  type SessionRow,
  type UserRow,
} from "./mappers";
import type { Repository } from "./types";

function throwIfError(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}

export class SupabaseRepository implements Repository {
  constructor(private readonly client: SupabaseClient) {}

  async findUserByPhone(phone: string) {
    const { data, error } = await this.client
      .from("users")
      .select("*")
      .eq("phone", phone)
      .maybeSingle();
    throwIfError(error);
    return data ? mapUser(data as UserRow) : null;
  }

  async findUserByEmail(email: string) {
    const { data, error } = await this.client
      .from("users")
      .select("*")
      .eq("email", email.toLowerCase())
      .maybeSingle();
    throwIfError(error);
    return data ? mapUser(data as UserRow) : null;
  }

  async findUserById(id: string) {
    const { data, error } = await this.client
      .from("users")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    throwIfError(error);
    return data ? mapUser(data as UserRow) : null;
  }

  async createUser(input: { phone?: string; email?: string }) {
    const { data, error } = await this.client
      .from("users")
      .insert({
        phone: input.phone ?? null,
        email: input.email?.toLowerCase() ?? null,
      })
      .select("*")
      .single();
    throwIfError(error);
    return mapUser(data as UserRow);
  }

  async updateUser(user: User) {
    const { error } = await this.client
      .from("users")
      .update({
        phone: user.phone ?? null,
        email: user.email?.toLowerCase() ?? null,
        phone_verified: user.phoneVerified,
        email_verified: user.emailVerified,
        last_activity_at: user.lastActivityAt.toISOString(),
      })
      .eq("id", user.id);
    throwIfError(error);
  }

  async savePendingVerification(verification: PendingVerification) {
    const { error } = await this.client.from("pending_verifications").upsert({
      phone: verification.phone,
      code: verification.code,
      expires_at: verification.expiresAt.toISOString(),
    });
    throwIfError(error);
  }

  async getPendingVerification(phone: string) {
    const { data, error } = await this.client
      .from("pending_verifications")
      .select("*")
      .eq("phone", phone)
      .maybeSingle();
    throwIfError(error);
    return data
      ? mapPendingVerification(data as PendingVerificationRow)
      : null;
  }

  async deletePendingVerification(phone: string) {
    const { error } = await this.client
      .from("pending_verifications")
      .delete()
      .eq("phone", phone);
    throwIfError(error);
  }

  async savePendingEmailVerification(verification: {
    email: string;
    code: string;
    expiresAt: Date;
  }) {
    const { error } = await this.client
      .from("pending_email_verifications")
      .upsert({
        email: verification.email.toLowerCase(),
        code: verification.code,
        expires_at: verification.expiresAt.toISOString(),
      });
    throwIfError(error);
  }

  async getPendingEmailVerification(email: string) {
    const { data, error } = await this.client
      .from("pending_email_verifications")
      .select("*")
      .eq("email", email.toLowerCase())
      .maybeSingle();
    throwIfError(error);
    return data
      ? {
          email: data.email as string,
          code: data.code as string,
          expiresAt: new Date(data.expires_at as string),
        }
      : null;
  }

  async deletePendingEmailVerification(email: string) {
    const { error } = await this.client
      .from("pending_email_verifications")
      .delete()
      .eq("email", email.toLowerCase());
    throwIfError(error);
  }

  async createSession(session: Session) {
    const { error } = await this.client.from("sessions").insert({
      token: session.token,
      user_id: session.userId,
      expires_at: session.expiresAt.toISOString(),
    });
    throwIfError(error);
  }

  async findSessionByToken(token: string) {
    const { data, error } = await this.client
      .from("sessions")
      .select("*")
      .eq("token", token)
      .maybeSingle();
    throwIfError(error);
    return data ? mapSession(data as SessionRow) : null;
  }

  async listAgencies() {
    const { data, error } = await this.client.from("agencies").select("*");
    throwIfError(error);
    return (data as AgencyRow[]).map(mapAgency);
  }

  async findAgencyById(id: string) {
    const { data, error } = await this.client
      .from("agencies")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    throwIfError(error);
    return data ? mapAgency(data as AgencyRow) : null;
  }

  async findAgencyBySlug(slug: string) {
    const { data, error } = await this.client
      .from("agencies")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    throwIfError(error);
    return data ? mapAgency(data as AgencyRow) : null;
  }

  async updateAgency(agency: Agency) {
    const { error } = await this.client
      .from("agencies")
      .update({
        slug: agency.slug,
        name: agency.name,
        cif: agency.cif ?? null,
        address: agency.address,
        city: agency.city,
        postal_code: agency.postalCode,
        phone: agency.phone,
        phone_published: agency.phonePublished,
        email: agency.email,
        legal_name: agency.legalName ?? null,
        legal_address: agency.legalAddress ?? null,
        website: agency.website ?? null,
        google_maps_url: agency.googleMapsUrl ?? null,
        idealista_url: agency.idealistaUrl ?? null,
        fotocasa_url: agency.fotocasaUrl ?? null,
        claimed: agency.claimed,
        verified: agency.verified,
        premium: agency.premium,
      })
      .eq("id", agency.id);
    throwIfError(error);
  }

  async createAgency(agency: Agency) {
    const { error } = await this.client.from("agencies").insert({
      id: agency.id,
      slug: agency.slug,
      name: agency.name,
      cif: agency.cif ?? null,
      legal_name: agency.legalName ?? null,
      legal_address: agency.legalAddress ?? null,
      address: agency.address,
      city: agency.city,
      postal_code: agency.postalCode,
      phone: agency.phone,
      phone_published: agency.phonePublished,
      email: agency.email,
      website: agency.website ?? null,
      google_maps_url: agency.googleMapsUrl ?? null,
      idealista_url: agency.idealistaUrl ?? null,
      fotocasa_url: agency.fotocasaUrl ?? null,
      claimed: agency.claimed,
      verified: agency.verified,
      premium: agency.premium,
      created_at: agency.createdAt.toISOString(),
    });
    throwIfError(error);
  }

  async listReviewsByAgency(agencyId: string) {
    const { data, error } = await this.client
      .from("reviews")
      .select("*")
      .eq("agency_id", agencyId);
    throwIfError(error);
    return (data as ReviewRow[]).map(mapReview);
  }

  async listReviewsByUser(userId: string) {
    const { data, error } = await this.client
      .from("reviews")
      .select("*")
      .eq("user_id", userId);
    throwIfError(error);
    return (data as ReviewRow[]).map(mapReview);
  }

  async listAllReviews() {
    const { data, error } = await this.client
      .from("reviews")
      .select("*")
      .order("created_at", { ascending: false });
    throwIfError(error);
    return (data as ReviewRow[]).map(mapReview);
  }

  async findReviewById(id: string) {
    const { data, error } = await this.client
      .from("reviews")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    throwIfError(error);
    return data ? mapReview(data as ReviewRow) : null;
  }

  async updateReview(review: Review) {
    const { error } = await this.client
      .from("reviews")
      .update({
        moderated: review.moderated,
        flagged: review.flagged,
      })
      .eq("id", review.id);
    throwIfError(error);
  }

  async createReview(review: Review) {
    const { error } = await this.client.from("reviews").insert({
      id: review.id,
      user_id: review.userId,
      agency_id: review.agencyId,
      role: review.role,
      rating: review.rating,
      title: review.title,
      body: review.body,
      incident_tags: review.incidentTags,
      created_at: review.createdAt.toISOString(),
      moderated: review.moderated,
      flagged: review.flagged,
    });
    throwIfError(error);
  }

  async createClaim(claim: Claim) {
    const { error } = await this.client.from("claims").insert({
      id: claim.id,
      agency_id: claim.agencyId,
      user_id: claim.userId,
      contact_name: claim.contactName,
      contact_email: claim.contactEmail,
      contact_phone: claim.contactPhone,
      representative_role: claim.representativeRole,
      company_cif: claim.companyCif ?? null,
      evidence: claim.evidence,
      documentation_urls: claim.documentationUrls,
      attestation_accepted: claim.attestationAccepted,
      business_phone_verified: claim.businessPhoneVerified,
      verification_path: claim.verificationPath,
      work_email_domain_match: claim.workEmailDomainMatch,
      status: claim.status,
      requested_at: claim.requestedAt.toISOString(),
      resolved_at: claim.resolvedAt?.toISOString() ?? null,
    });
    throwIfError(error);
  }

  async listClaims() {
    const { data, error } = await this.client
      .from("claims")
      .select("*")
      .order("requested_at", { ascending: false });
    throwIfError(error);
    return (data as ClaimRow[]).map(mapClaim);
  }

  async findClaimById(id: string) {
    const { data, error } = await this.client
      .from("claims")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    throwIfError(error);
    return data ? mapClaim(data as ClaimRow) : null;
  }

  async updateClaim(claim: Claim) {
    const { error } = await this.client
      .from("claims")
      .update({
        status: claim.status,
        resolved_at: claim.resolvedAt?.toISOString() ?? null,
      })
      .eq("id", claim.id);
    throwIfError(error);
  }

  async findResponseByReviewId(reviewId: string) {
    const { data, error } = await this.client
      .from("agency_responses")
      .select("*")
      .eq("review_id", reviewId)
      .maybeSingle();
    throwIfError(error);
    return data ? mapAgencyResponse(data as AgencyResponseRow) : null;
  }

  async createAgencyResponse(response: AgencyResponse) {
    const { error } = await this.client.from("agency_responses").insert({
      id: response.id,
      review_id: response.reviewId,
      agency_id: response.agencyId,
      body: response.body,
      created_at: response.createdAt.toISOString(),
    });
    throwIfError(error);
  }

  async listAliasesByAgency(agencyId: string) {
    const { data, error } = await this.client
      .from("agency_name_aliases")
      .select("*")
      .eq("agency_id", agencyId);
    throwIfError(error);
    return (data ?? []).map((row) => ({
      id: row.id as string,
      agencyId: row.agency_id as string,
      alias: row.alias as string,
      kind: row.kind as "commercial" | "legal",
      effectiveUntil: row.effective_until
        ? new Date(row.effective_until as string)
        : undefined,
      sourceUrl: (row.source_url as string) ?? undefined,
      note: (row.note as string) ?? undefined,
    }));
  }

  async listAllAliases() {
    const { data, error } = await this.client.from("agency_name_aliases").select("*");
    throwIfError(error);
    return (data ?? []).map((row) => ({
      id: row.id as string,
      agencyId: row.agency_id as string,
      alias: row.alias as string,
      kind: row.kind as "commercial" | "legal",
      effectiveUntil: row.effective_until
        ? new Date(row.effective_until as string)
        : undefined,
      sourceUrl: (row.source_url as string) ?? undefined,
      note: (row.note as string) ?? undefined,
    }));
  }

  async createAlias(alias: import("@/lib/domain/types").AgencyNameAlias) {
    const { error } = await this.client.from("agency_name_aliases").insert({
      id: alias.id,
      agency_id: alias.agencyId,
      alias: alias.alias,
      kind: alias.kind,
      effective_until: alias.effectiveUntil?.toISOString() ?? null,
      source_url: alias.sourceUrl ?? null,
      note: alias.note ?? null,
    });
    throwIfError(error);
  }

  async savePendingBusinessLineVerification(
    userId: string,
    agencyId: string,
    verification: PendingVerification,
  ) {
    const { error } = await this.client
      .from("pending_business_line_verifications")
      .upsert({
        user_id: userId,
        agency_id: agencyId,
        code: verification.code,
        expires_at: verification.expiresAt.toISOString(),
      });
    throwIfError(error);
  }

  async getPendingBusinessLineVerification(userId: string, agencyId: string) {
    const { data, error } = await this.client
      .from("pending_business_line_verifications")
      .select("*")
      .eq("user_id", userId)
      .eq("agency_id", agencyId)
      .maybeSingle();
    throwIfError(error);
    if (!data) return null;
    return {
      phone: "",
      code: data.code as string,
      expiresAt: new Date(data.expires_at as string),
    };
  }

  async deletePendingBusinessLineVerification(userId: string, agencyId: string) {
    const { error } = await this.client
      .from("pending_business_line_verifications")
      .delete()
      .eq("user_id", userId)
      .eq("agency_id", agencyId);
    throwIfError(error);
  }

  async markBusinessLineVerified(
    userId: string,
    agencyId: string,
    expiresAt: Date,
  ) {
    const { error } = await this.client
      .from("agency_business_line_verified")
      .upsert({
        user_id: userId,
        agency_id: agencyId,
        verified_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
      });
    throwIfError(error);
  }

  async hasBusinessLineVerified(userId: string, agencyId: string) {
    const { data, error } = await this.client
      .from("agency_business_line_verified")
      .select("expires_at")
      .eq("user_id", userId)
      .eq("agency_id", agencyId)
      .maybeSingle();
    throwIfError(error);
    if (!data) return false;
    return new Date(data.expires_at as string) > new Date();
  }

  async clearBusinessLineVerified(userId: string, agencyId: string) {
    const { error } = await this.client
      .from("agency_business_line_verified")
      .delete()
      .eq("user_id", userId)
      .eq("agency_id", agencyId);
    throwIfError(error);
  }

  async createAgencySubmission(submission: AgencySubmission) {
    const { error } = await this.client.from("agency_submissions").insert({
      id: submission.id,
      user_id: submission.userId,
      name: submission.name,
      city: submission.city,
      postal_code: submission.postalCode,
      address: submission.address,
      no_phone_online: submission.noPhoneOnline,
      phone: submission.phone ?? null,
      email: submission.email ?? null,
      website: submission.website ?? null,
      idealista_url: submission.idealistaUrl ?? null,
      note: submission.note ?? null,
      status: submission.status,
      created_at: submission.createdAt.toISOString(),
      resolved_at: submission.resolvedAt?.toISOString() ?? null,
      created_agency_id: submission.createdAgencyId ?? null,
      created_agency_slug: submission.createdAgencySlug ?? null,
    });
    throwIfError(error);
  }

  async listAgencySubmissions() {
    const { data, error } = await this.client
      .from("agency_submissions")
      .select("*")
      .order("created_at", { ascending: false });
    throwIfError(error);
    return (data ?? []).map((row) => this.mapSubmission(row));
  }

  async findAgencySubmissionById(id: string) {
    const { data, error } = await this.client
      .from("agency_submissions")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    throwIfError(error);
    return data ? this.mapSubmission(data) : null;
  }

  async updateAgencySubmission(submission: AgencySubmission) {
    const { error } = await this.client
      .from("agency_submissions")
      .update({
        status: submission.status,
        resolved_at: submission.resolvedAt?.toISOString() ?? null,
        created_agency_id: submission.createdAgencyId ?? null,
        created_agency_slug: submission.createdAgencySlug ?? null,
      })
      .eq("id", submission.id);
    throwIfError(error);
  }

  private mapSubmission(row: Record<string, unknown>): AgencySubmission {
    return {
      id: row.id as string,
      userId: row.user_id as string,
      name: row.name as string,
      city: row.city as string,
      postalCode: row.postal_code as string,
      address: row.address as string,
      noPhoneOnline: Boolean(row.no_phone_online),
      phone: (row.phone as string) ?? undefined,
      email: (row.email as string) ?? undefined,
      website: (row.website as string) ?? undefined,
      idealistaUrl: (row.idealista_url as string) ?? undefined,
      note: (row.note as string) ?? undefined,
      status: row.status as AgencySubmission["status"],
      createdAt: new Date(row.created_at as string),
      resolvedAt: row.resolved_at
        ? new Date(row.resolved_at as string)
        : undefined,
      createdAgencyId: (row.created_agency_id as string) ?? undefined,
      createdAgencySlug: (row.created_agency_slug as string) ?? undefined,
    };
  }
}
