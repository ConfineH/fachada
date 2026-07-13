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

  submit(user: User | undefined, input: unknown): Claim {
    if (!user?.phoneVerified) {
      throw new ClaimError("Phone verification required");
    }

    const data = claimInputSchema.parse(input);
    const agency = this.repo.findAgencyById(data.agencyId);
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

    this.repo.createClaim(claim);
    return claim;
  }

  approve(claimId: string): Claim {
    const claim = this.repo.findClaimById(claimId);
    if (!claim) throw new ClaimError("Claim not found");

    const agency = this.repo.findAgencyById(claim.agencyId);
    if (!agency) throw new ClaimError("Agency not found");

    claim.status = "aprobado";
    claim.resolvedAt = new Date();
    agency.claimed = true;
    agency.verified = true;

    this.repo.updateClaim(claim);
    this.repo.updateAgency(agency);
    return claim;
  }

  respond(user: User | undefined, agencyId: string, input: unknown): AgencyResponse {
    if (!user?.phoneVerified) {
      throw new ClaimError("Phone verification required");
    }

    const agency = this.repo.findAgencyById(agencyId);
    if (!agency?.verified) {
      throw new ClaimError("Agency must be verified to respond");
    }

    const data = agencyResponseSchema.parse(input);
    const review = this.repo
      .listReviewsByAgency(agencyId)
      .find((r) => r.id === data.reviewId);
    if (!review) throw new ClaimError("Review not found");

    if (this.repo.findResponseByReviewId(data.reviewId)) {
      throw new ClaimError("Review already has a response");
    }

    const response: AgencyResponse = {
      id: randomUUID(),
      reviewId: data.reviewId,
      agencyId,
      body: data.body,
      createdAt: new Date(),
    };

    this.repo.createAgencyResponse(response);
    return response;
  }
}
