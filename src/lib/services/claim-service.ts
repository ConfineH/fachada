import { randomUUID } from "node:crypto";

import type { AgencyResponse, Claim, User } from "@/lib/domain/types";
import {
  agencyResponseSchema,
  claimInputSchema,
} from "@/lib/domain/validation";
import type { Repository } from "@/lib/repositories/types";

export class ClaimError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ClaimError";
  }
}

export class ClaimService {
  constructor(private readonly repo: Repository) {}

  async submit(user: User | undefined, input: unknown): Promise<Claim> {
    if (!user?.phoneVerified) {
      throw new ClaimError("Phone verification required");
    }

    const data = claimInputSchema.parse(input);
    const agency = await this.repo.findAgencyById(data.agencyId);
    if (!agency) throw new ClaimError("Agency not found");
    if (agency.claimed) throw new ClaimError("Agency already claimed");

    const claim: Claim = {
      id: randomUUID(),
      agencyId: data.agencyId,
      userId: user.id,
      contactName: data.contactName,
      contactEmail: data.contactEmail,
      contactPhone: data.contactPhone,
      documentationUrls: data.documentationUrls,
      status: "pendiente",
      requestedAt: new Date(),
    };

    await this.repo.createClaim(claim);
    return claim;
  }

  async approve(claimId: string): Promise<Claim> {
    const claim = await this.repo.findClaimById(claimId);
    if (!claim) throw new ClaimError("Claim not found");

    const agency = await this.repo.findAgencyById(claim.agencyId);
    if (!agency) throw new ClaimError("Agency not found");

    claim.status = "aprobado";
    claim.resolvedAt = new Date();
    agency.claimed = true;
    agency.verified = true;

    await this.repo.updateClaim(claim);
    await this.repo.updateAgency(agency);
    return claim;
  }

  async reject(claimId: string): Promise<Claim> {
    const claim = await this.repo.findClaimById(claimId);
    if (!claim) throw new ClaimError("Claim not found");

    claim.status = "rechazado";
    claim.resolvedAt = new Date();
    await this.repo.updateClaim(claim);
    return claim;
  }

  async respond(
    user: User | undefined,
    agencyId: string,
    input: unknown,
  ): Promise<AgencyResponse> {
    if (!user?.phoneVerified) {
      throw new ClaimError("Phone verification required");
    }

    if (!(await this.canManageAgency(user, agencyId))) {
      throw new ClaimError("Not authorized to respond for this agency");
    }

    const data = agencyResponseSchema.parse(input);
    const reviews = await this.repo.listReviewsByAgency(agencyId);
    const review = reviews.find((r) => r.id === data.reviewId);
    if (!review) throw new ClaimError("Review not found");

    if (await this.repo.findResponseByReviewId(data.reviewId)) {
      throw new ClaimError("Review already has a response");
    }

    const response: AgencyResponse = {
      id: randomUUID(),
      reviewId: data.reviewId,
      agencyId,
      body: data.body,
      createdAt: new Date(),
    };

    await this.repo.createAgencyResponse(response);
    return response;
  }

  async canManageAgency(user: User | undefined, agencyId: string) {
    if (!user?.phoneVerified) return false;

    const agency = await this.repo.findAgencyById(agencyId);
    if (!agency?.verified) return false;

    const claims = await this.repo.listClaims();
    return claims.some(
      (claim) =>
        claim.agencyId === agencyId &&
        claim.userId === user.id &&
        claim.status === "aprobado",
    );
  }
}
