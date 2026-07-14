import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  Agency,
  AgencyResponse,
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

  async findUserById(id: string) {
    const { data, error } = await this.client
      .from("users")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    throwIfError(error);
    return data ? mapUser(data as UserRow) : null;
  }

  async createUser(phone: string) {
    const { data, error } = await this.client
      .from("users")
      .insert({ phone })
      .select("*")
      .single();
    throwIfError(error);
    return mapUser(data as UserRow);
  }

  async updateUser(user: User) {
    const { error } = await this.client
      .from("users")
      .update({
        phone_verified: user.phoneVerified,
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
        email: agency.email,
        website: agency.website ?? null,
        google_maps_url: agency.googleMapsUrl ?? null,
        claimed: agency.claimed,
        verified: agency.verified,
        premium: agency.premium,
      })
      .eq("id", agency.id);
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
      documentation_urls: claim.documentationUrls,
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
}
